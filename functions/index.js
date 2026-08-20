/* Cloud Function backing the app's "Quick capture" feature.
 *
 * The client pastes a raw Slack message / email / note and sends it here
 * along with the current role's checklist sections (from data.js — kept
 * client-side so this function stays decoupled from that content). Claude
 * is asked to pick out genuine matches and draft a concrete note for each,
 * using tool-forced output so the response is always valid structured data
 * rather than freeform text we'd have to parse.
 *
 * The API key never reaches the browser: it's a Firebase Functions secret,
 * injected as an env var only inside this function's execution.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const MATCH_TOOL = {
  name: "record_matches",
  description: "Record checklist criteria that the pasted text provides genuine evidence for.",
  input_schema: {
    type: "object",
    properties: {
      matches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            section: { type: "string", description: "Exact section name from the candidate list." },
            item: { type: "string", description: "Exact item text from the candidate list." },
            note: {
              type: "string",
              description:
                "A concise, concrete rewrite of the relevant part of the text, suitable to paste directly as evidence for a manager review.",
            },
            confidence: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["section", "item", "note", "confidence"],
        },
      },
    },
    required: ["matches"],
  },
};

exports.classifyEvidence = onCall({ secrets: [ANTHROPIC_API_KEY], cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in to use quick capture.");
  }

  const { text, sections } = request.data || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new HttpsError("invalid-argument", "Missing text to classify.");
  }
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new HttpsError("invalid-argument", "Missing checklist sections.");
  }

  const candidateList = sections
    .flatMap((s) => (s.items || []).map((item) => `- [${s.name}] ${item}`))
    .join("\n");

  const prompt = `You are helping a QA analyst log evidence against a fixed list of career-growth checklist criteria.

Candidate criteria (only use these exact section/item pairs):
${candidateList}

Pasted text (a Slack message, email, or note):
"""
${text.trim().slice(0, 6000)}
"""

Identify which candidate criteria, if any, this text provides genuine evidence for. Be conservative — intangible criteria (communication, mentoring, accountability) need a real, specific action described, not just a vague mention. Zero matches is a fine answer. For each match, write "note" as a short, concrete rewrite the analyst could paste directly as evidence — don't just quote the raw text back.`;

  let resp;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY.value(),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        tools: [MATCH_TOOL],
        tool_choice: { type: "tool", name: "record_matches" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    console.error("Anthropic API request failed:", err);
    throw new HttpsError("internal", "Classifier request failed.");
  }

  if (!resp.ok) {
    console.error("Anthropic API error:", resp.status, await resp.text());
    throw new HttpsError("internal", "Classifier request failed.");
  }

  const payload = await resp.json();
  const toolUse = (payload.content || []).find((block) => block.type === "tool_use");
  if (!toolUse) return { matches: [] };

  const matches = Array.isArray(toolUse.input.matches) ? toolUse.input.matches : [];

  // The model is instructed to echo exact section/item text, but don't trust
  // that blindly — only pass through matches against a real candidate pair.
  const valid = new Set(sections.flatMap((s) => (s.items || []).map((item) => `${s.name}::${item}`)));
  return { matches: matches.filter((m) => valid.has(`${m.section}::${m.item}`)) };
});
