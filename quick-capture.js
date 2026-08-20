/* Quick capture: paste a Slack message, email, or note and get AI-suggested
 * matches against the current role's checklist criteria, via the
 * classifyEvidence Cloud Function (see functions/index.js).
 *
 * Gated behind cloud sync being configured AND the user being signed in —
 * the classifier costs real API tokens, so it rides the same auth as sync
 * rather than being open to anyone loading the page. Suggestions are never
 * applied automatically: the analyst reviews and attaches each one, which
 * matters most for soft criteria (communication, mentoring) where a wrong
 * auto-match would be worse than no match.
 */
(function () {
  const configured =
    typeof firebaseConfig !== "undefined" &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("YOUR_");

  if (!configured) return;

  const classifyEvidence = firebase.functions().httpsCallable("classifyEvidence");
  let signedIn = false;

  firebase.auth().onAuthStateChanged((user) => {
    signedIn = !!user;
    document.querySelectorAll(".quick-capture-toggle").forEach((btn) => {
      btn.disabled = !signedIn;
      btn.title = signedIn ? "" : "Sign in with Google to use quick capture";
    });
  });

  ["l3", "l2"].forEach(wireCapture);

  function wireCapture(roleKey) {
    const toggle = document.getElementById(`${roleKey}-captureToggle`);
    const body = document.getElementById(`${roleKey}-captureBody`);
    const input = document.getElementById(`${roleKey}-captureInput`);
    const suggestBtn = document.getElementById(`${roleKey}-captureSuggest`);
    const status = document.getElementById(`${roleKey}-captureStatus`);
    const results = document.getElementById(`${roleKey}-captureResults`);

    toggle.addEventListener("click", () => {
      const opening = body.hidden;
      body.hidden = !opening;
      toggle.setAttribute("aria-expanded", String(opening));
    });

    suggestBtn.addEventListener("click", async () => {
      if (!signedIn) {
        setStatus(status, "Sign in with Google first.", true);
        return;
      }
      const text = input.value.trim();
      if (!text) return;

      suggestBtn.disabled = true;
      setStatus(status, "Reading it over…", false);
      results.innerHTML = "";

      try {
        const sections = ROLES[roleKey].sections.map((s) => ({ name: s.name, items: s.items }));
        const { data } = await classifyEvidence({ text, sections });
        renderResults(roleKey, data.matches || [], results, status);
      } catch (err) {
        console.error("Quick capture failed:", err);
        setStatus(status, "Couldn't get suggestions — see console.", true);
      } finally {
        suggestBtn.disabled = false;
      }
    });
  }

  function renderResults(roleKey, matches, results, status) {
    if (matches.length === 0) {
      setStatus(status, "No confident matches found. Try pasting more context, or add it manually below.", false);
      return;
    }

    setStatus(status, `${matches.length} possible match${matches.length === 1 ? "" : "es"} — review before attaching.`, false);

    matches.forEach((match) => {
      const card = document.createElement("div");
      card.className = "quick-capture-suggestion";
      card.innerHTML = `
        <div class="quick-capture-suggestion-meta">
          <span class="quick-capture-confidence">${escapeHtml(match.confidence || "")}</span>
          <span class="quick-capture-suggestion-item">${escapeHtml(match.item)}</span>
        </div>
        <p class="quick-capture-note">${escapeHtml(match.note)}</p>
        <div class="quick-capture-suggestion-actions">
          <button type="button" class="btn small primary">Attach as note</button>
          <button type="button" class="btn small">Dismiss</button>
        </div>
      `;
      card.querySelector(".btn.primary").addEventListener("click", () => {
        attachNoteToCriterion(roleKey, match.section, match.item, match.note);
        card.remove();
      });
      card.querySelector(".btn:not(.primary)").addEventListener("click", () => card.remove());
      results.appendChild(card);
    });
  }

  function setStatus(el, text, isError) {
    el.textContent = text;
    el.className = "quick-capture-status" + (isError ? " error" : "");
  }
})();
