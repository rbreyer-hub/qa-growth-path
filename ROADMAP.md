# Roadmap: evidence capture pipeline

The hardest part of this tracker isn't ticking boxes — it's remembering to write
down evidence for intangible criteria (communication, mentoring, accountability)
at the moment they actually happen, not weeks later at review time. This doc
tracks the plan for closing that gap.

## Tier 1 — Quick capture (built)

Paste a raw Slack message, email, or note into the L3 or L2 tab. A Cloud
Function (`functions/index.js`, `classifyEvidence`) sends it to Claude along
with the current role's checklist criteria and gets back suggested matches —
each with a drafted, concrete note — using tool-forced structured output so
the response is always valid, not freeform text to parse.

Suggestions are never auto-applied. You review each one and click *Attach as
note* or *Dismiss*. This matters most for soft criteria, where a
plausible-but-wrong auto-match is worse than no match. See the README's
"Quick capture setup" section for deploying it.

This is still manual: you have to remember to paste something. It solves the
"which criterion does this belong to" friction, not the "remember to capture
it" friction.

## Tier 2 — Automated ingestion (future)

Feed the same classifier automatically instead of requiring a paste:

- **Slack**: a Slack app subscribed to specific channels, or a
  `/log-evidence` slash command for one-off capture. Requires Slack app
  approval/install in the Patriot workspace.
- **Email**: a Gmail push subscription (Pub/Sub) or an Apps Script trigger
  forwarding matching messages to the same Cloud Function. Requires Gmail API
  OAuth scopes.

Both land in a **review inbox** in the app (a new tab or panel showing pending
suggestions across all sources) rather than writing directly to a criterion —
same trust model as Tier 1, just removing the "remember to paste" step.

Bigger lift than Tier 1: needs Slack workspace admin approval and Gmail API
scopes, which depend on what access is actually available at Patriot.

## Optimization layer — feedback loop (future)

Once there's a meaningful history of accepted/dismissed suggestions, use it
to improve future matching instead of treating every classification as a
cold start:

- Log each suggestion's outcome (attached / dismissed / edited-before-attach)
  to Firestore, per user.
- Feed a handful of the user's own past accepted matches back into the
  classifier prompt as few-shot examples, so it learns what "good evidence"
  looks like for *this* person's writing style and role, not just the generic
  criteria text.
- Surface a lightweight signal in the review inbox (e.g. "you've dismissed
  matches like this before") rather than silently suppressing anything —
  keep the human in the loop, just make their job faster over time.

This only pays off after Tier 1 has real usage data, so it's sequenced last.
