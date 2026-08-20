/* QA Growth Tracker — frontend logic.
 *
 * State model (persisted to localStorage under STORAGE_KEY):
 * {
 *   version: 1,
 *   identity: { name: string, startDate: string, reviewDate: string },
 *   progress: {
 *     "<sectionName>::<itemText>": {
 *       completed: boolean,
 *       completedDate: string,
 *       notes: string,
 *       screenshot: string | null   // data: URL of a resized JPEG, or null
 *     }
 *   }
 * }
 *
 * Keys are derived from each role's content (section + item text) so renaming
 * a criterion in data.js will surface as a "new" item rather than silently
 * moving progress. Item text must stay unique across roles in data.js, since
 * progress isn't namespaced by role.
 *
 * localStorage is always the source of truth for rendering. firebase-sync.js
 * (loaded after this file, optional) mirrors state to/from Firestore via the
 * onLocalChange hook and applyRemoteState() below.
 */

const STORAGE_KEY = "qa-growth-tracker.v1";

const state = loadState();

document.addEventListener("DOMContentLoaded", () => {
  hydrateIdentity();
  renderChecklist("l3", "l3-checklist");
  renderChecklist("l2", "l2-checklist");
  renderReferenceRole("senior");
  wireTabs();
  wireActions();
  updateProgress("l3");
  updateProgress("l2");
});

/* ---------- Persistence ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed.version) return defaultState();
    return parsed;
  } catch (err) {
    console.warn("Failed to load saved state, starting fresh:", err);
    return defaultState();
  }
}

function defaultState() {
  return {
    version: 1,
    identity: { name: "", startDate: "", reviewDate: "" },
    progress: {},
  };
}

// Hooked by firebase-sync.js to push changes to the cloud. Left null (no-op)
// when cloud sync isn't configured or the user isn't signed in.
let onLocalChange = null;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (typeof onLocalChange === "function") onLocalChange(state);
}

// Overwrites identity/progress with a remote copy (e.g. from Firestore) and
// re-renders. Used only by firebase-sync.js.
function applyRemoteState(remote) {
  if (remote.identity) state.identity = remote.identity;
  if (remote.progress) state.progress = remote.progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  refreshIdentityFields();
  renderChecklist("l3", "l3-checklist");
  renderChecklist("l2", "l2-checklist");
  updateProgress("l3");
  updateProgress("l2");
}

function hasProgressData(s) {
  return !!(s && s.progress && Object.keys(s.progress).length > 0);
}

function progressKey(sectionName, itemText) {
  return `${sectionName}::${itemText}`;
}

function getProgress(sectionName, itemText) {
  const key = progressKey(sectionName, itemText);
  return state.progress[key] || { completed: false, completedDate: "", notes: "", screenshot: null };
}

function setProgress(sectionName, itemText, patch) {
  const key = progressKey(sectionName, itemText);
  state.progress[key] = { ...getProgress(sectionName, itemText), ...patch };
  saveState();
}

/* ---------- Identity ---------- */
function hydrateIdentity() {
  refreshIdentityFields();

  const name = document.getElementById("userName");
  const start = document.getElementById("startDate");
  const review = document.getElementById("reviewDate");

  name.addEventListener("input", () => {
    state.identity.name = name.value;
    saveState();
  });
  start.addEventListener("change", () => {
    state.identity.startDate = start.value;
    saveState();
  });
  review.addEventListener("change", () => {
    state.identity.reviewDate = review.value;
    saveState();
  });
}

function refreshIdentityFields() {
  document.getElementById("userName").value = state.identity.name || "";
  document.getElementById("startDate").value = state.identity.startDate || "";
  document.getElementById("reviewDate").value = state.identity.reviewDate || "";
}

/* ---------- Checklists (L3 growth target, L2 current role) ---------- */
function renderChecklist(roleKey, containerId) {
  const role = ROLES[roleKey];
  document.getElementById(`${roleKey}-title`).textContent = role.title;
  document.getElementById(`${roleKey}-tagline`).textContent = role.tagline;
  document.getElementById(`${roleKey}-intro`).textContent = role.intro;
  const src = document.getElementById(`${roleKey}-source`);
  src.href = role.sourceUrl;
  src.textContent = "View source in Confluence →";

  const container = document.getElementById(containerId);
  container.innerHTML = "";

  role.sections.forEach((section) => {
    const block = document.createElement("div");
    block.className = "section-block";
    block.innerHTML = `<h3>${escapeHtml(section.name)}</h3>`;

    section.items.forEach((itemText) => {
      block.appendChild(renderCriterion(roleKey, section.name, itemText));
    });

    container.appendChild(block);
  });
}

function renderCriterion(roleKey, sectionName, itemText) {
  const data = getProgress(sectionName, itemText);
  const wrapper = document.createElement("div");
  wrapper.className = "criterion" + (data.completed ? " completed" : "");
  wrapper.dataset.role = roleKey;
  wrapper.dataset.section = sectionName;
  wrapper.dataset.item = itemText;

  wrapper.innerHTML = `
    <div class="criterion-header">
      <input type="checkbox" ${data.completed ? "checked" : ""} aria-label="Mark as completed" />
      <div class="criterion-title">${escapeHtml(itemText)}</div>
    </div>
    <div class="criterion-body">
      <div>
        <label>Notes</label>
        <textarea placeholder="Describe what you did, link to tickets, training sessions, PRs, dashboards, etc. The more concrete, the better — your manager will read this.">${escapeHtml(
          data.notes
        )}</textarea>
        <div class="criterion-screenshot">
          <div class="screenshot-attach" ${data.screenshot ? "hidden" : ""}>
            <button type="button" class="btn small screenshot-add">Add screenshot</button>
            <input type="file" accept="image/*" class="screenshot-input" hidden />
            <span class="screenshot-hint">or click into Notes above and paste (Ctrl/Cmd+V) a copied screenshot</span>
          </div>
          <div class="screenshot-preview" ${data.screenshot ? "" : "hidden"}>
            <img class="screenshot-thumb" src="${data.screenshot ? escapeAttr(data.screenshot) : ""}" alt="Attached screenshot" />
            <button type="button" class="btn small danger screenshot-remove">Remove</button>
          </div>
        </div>
      </div>
      <div class="criterion-meta">
        <label>Date completed
          <input type="date" value="${escapeAttr(data.completedDate)}" />
        </label>
      </div>
    </div>
  `;

  const checkbox = wrapper.querySelector('input[type="checkbox"]');
  const notes = wrapper.querySelector("textarea");
  const dateInput = wrapper.querySelector('input[type="date"]');

  checkbox.addEventListener("change", () => {
    const completed = checkbox.checked;
    const patch = { completed };
    if (completed && !dateInput.value) {
      const today = new Date().toISOString().slice(0, 10);
      dateInput.value = today;
      patch.completedDate = today;
    }
    setProgress(sectionName, itemText, patch);
    wrapper.classList.toggle("completed", completed);
    updateProgress(roleKey);
  });

  notes.addEventListener("input", () => {
    setProgress(sectionName, itemText, { notes: notes.value });
  });

  dateInput.addEventListener("change", () => {
    setProgress(sectionName, itemText, { completedDate: dateInput.value });
  });

  wireScreenshot(wrapper, sectionName, itemText);

  return wrapper;
}

/* ---------- Screenshot attachment (one per criterion) ---------- */
const MAX_SCREENSHOT_DIMENSION = 1280;
const SCREENSHOT_JPEG_QUALITY = 0.72;

function wireScreenshot(wrapper, sectionName, itemText) {
  const attach = wrapper.querySelector(".screenshot-attach");
  const addBtn = wrapper.querySelector(".screenshot-add");
  const input = wrapper.querySelector(".screenshot-input");
  const preview = wrapper.querySelector(".screenshot-preview");
  const thumb = wrapper.querySelector(".screenshot-thumb");
  const removeBtn = wrapper.querySelector(".screenshot-remove");

  async function applyScreenshot(file) {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await resizeImageFile(file);
      setProgress(sectionName, itemText, { screenshot: dataUrl });
      thumb.src = dataUrl;
      preview.hidden = false;
      attach.hidden = true;
    } catch (err) {
      console.error("Failed to process screenshot:", err);
      alert("Couldn't read that image — try a different file.");
    }
  }

  addBtn.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    applyScreenshot(input.files[0]);
    input.value = "";
  });

  // Lets the user paste a copied screenshot directly instead of saving it to
  // a file first — the common path when grabbing evidence from a Slack
  // thread, ticket, or dashboard.
  wrapper.addEventListener("paste", (evt) => {
    const item = Array.from(evt.clipboardData?.items || []).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    evt.preventDefault();
    applyScreenshot(item.getAsFile());
  });

  removeBtn.addEventListener("click", () => {
    setProgress(sectionName, itemText, { screenshot: null });
    thumb.src = "";
    preview.hidden = true;
    attach.hidden = false;
  });
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_SCREENSHOT_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", SCREENSHOT_JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error("Could not decode image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/* ---------- Quick capture support (consumed by quick-capture.js) ---------- */
// Appends a note to a criterion (used when the user attaches an AI-suggested
// match) and keeps the on-screen textarea in sync without a full re-render.
function attachNoteToCriterion(roleKey, sectionName, itemText, noteText) {
  const existing = getProgress(sectionName, itemText).notes || "";
  const merged = existing ? `${existing}\n\n${noteText}` : noteText;
  setProgress(sectionName, itemText, { notes: merged });

  const container = document.getElementById(`${roleKey}-checklist`);
  const wrapper = Array.from(container.querySelectorAll(".criterion")).find(
    (el) => el.dataset.section === sectionName && el.dataset.item === itemText
  );
  if (wrapper) wrapper.querySelector("textarea").value = merged;
}

/* ---------- Reference roles (L2, Senior) ---------- */
function renderReferenceRole(key) {
  const role = ROLES[key];
  document.getElementById(`${key}-title`).textContent = role.title;
  document.getElementById(`${key}-tagline`).textContent = role.tagline;
  document.getElementById(`${key}-intro`).textContent = role.intro;
  const src = document.getElementById(`${key}-source`);
  src.href = role.sourceUrl;
  src.textContent = "View source in Confluence →";

  const container = document.getElementById(`${key}-content`);
  container.innerHTML = "";

  role.sections.forEach((section) => {
    const block = document.createElement("div");
    block.className = "section-block";
    const ul = document.createElement("ul");
    section.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    block.innerHTML = `<h3>${escapeHtml(section.name)}</h3>`;
    block.appendChild(ul);
    container.appendChild(block);
  });
}

/* ---------- Tabs ---------- */
function wireTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.querySelector(`.tab-panel[data-panel="${target}"]`).classList.add("active");
    });
  });
}

/* ---------- Progress bars (one per role) ---------- */
function updateProgress(roleKey) {
  const allItems = ROLES[roleKey].sections.flatMap((s) =>
    s.items.map((i) => ({ section: s.name, item: i }))
  );
  const total = allItems.length;
  const done = allItems.filter(({ section, item }) => getProgress(section, item).completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById(`${roleKey}-progressFill`).style.width = `${pct}%`;
  document.getElementById(`${roleKey}-progressLabel`).textContent = `${done} of ${total} completed (${pct}%)`;
}

/* ---------- Actions: export / import / report / reset ---------- */
function wireActions() {
  document.getElementById("exportJson").addEventListener("click", exportJson);
  document.getElementById("importJsonFile").addEventListener("change", importJson);
  document.getElementById("printReport").addEventListener("click", () => {
    buildPrintReport();
    window.print();
  });
  document.getElementById("exportHtml").addEventListener("click", exportStandaloneHtml);
  document.getElementById("resetAll").addEventListener("click", resetAll);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  downloadBlob(blob, `qa-growth-${(state.identity.name || "tracker").replace(/\s+/g, "-").toLowerCase()}-${todayIso()}.json`);
}

function importJson(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const incoming = JSON.parse(e.target.result);
      if (!incoming || incoming.version !== 1) {
        alert("That file doesn't look like a QA Growth Tracker export (missing version).");
        return;
      }
      if (!confirm("Import will replace your current progress. Continue?")) return;
      Object.assign(state, incoming);
      saveState();
      location.reload();
    } catch (err) {
      alert("Could not parse that file as JSON.");
    }
  };
  reader.readAsText(file);
  evt.target.value = "";
}

function resetAll() {
  if (!confirm("Reset all progress, notes, and identity fields? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

/* ---------- Print report ---------- */
function buildPrintReport() {
  const role = ROLES.l3;
  const allItems = role.sections.flatMap((s) =>
    s.items.map((item) => ({ section: s.name, item }))
  );
  const total = allItems.length;
  const done = allItems.filter(({ section, item }) => getProgress(section, item).completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const region = document.getElementById("printReportRegion");
  const name = state.identity.name || "QA Analyst";
  const start = state.identity.startDate ? formatDate(state.identity.startDate) : "—";
  const review = state.identity.reviewDate ? formatDate(state.identity.reviewDate) : "—";
  const generated = formatDate(todayIso());

  let html = `
    <h1>QA Analyst Level 3 — Growth Evidence</h1>
    <div class="header-meta">
      <span><strong>Analyst:</strong> ${escapeHtml(name)}</span>
      <span><strong>Started tracking:</strong> ${escapeHtml(start)}</span>
      <span><strong>Target review:</strong> ${escapeHtml(review)}</span>
      <span><strong>Report generated:</strong> ${escapeHtml(generated)}</span>
    </div>
    <div class="summary">
      <strong>Progress:</strong> ${done} of ${total} expectations marked complete (${pct}%).
      Source: <em>${escapeHtml(role.title)}</em>, PDD Confluence space.
    </div>
  `;

  role.sections.forEach((section) => {
    html += `<h2>${escapeHtml(section.name)}</h2>`;
    section.items.forEach((item) => {
      const data = getProgress(section.name, item);
      const status = data.completed
        ? `Completed${data.completedDate ? " · " + formatDate(data.completedDate) : ""}`
        : "In progress";
      const evidence = (data.notes || "").trim();
      html += `
        <div class="item ${data.completed ? "done" : "pending"}">
          <div class="title-row">
            <div>${escapeHtml(item)}</div>
            <div class="status">${escapeHtml(status)}</div>
          </div>
          <div class="evidence ${evidence ? "" : "empty"}">${
            evidence ? escapeHtml(evidence) : "No evidence captured yet."
          }</div>
          ${data.screenshot ? `<img class="evidence-screenshot" src="${escapeAttr(data.screenshot)}" alt="Screenshot evidence for ${escapeAttr(item)}" />` : ""}
        </div>
      `;
    });
  });

  html += `
    <div class="print-footer">
      Generated by the QA Growth Tracker on ${escapeHtml(generated)}.
    </div>
  `;

  region.innerHTML = html;
}

/* ---------- Standalone HTML export ---------- */
function exportStandaloneHtml() {
  buildPrintReport();
  const reportHtml = document.getElementById("printReportRegion").innerHTML;
  const name = state.identity.name || "QA Analyst";
  const generated = formatDate(todayIso());

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>QA Growth Report — ${escapeHtml(name)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 820px; margin: 32px auto; padding: 0 24px; color: #1f2330; line-height: 1.5; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  .header-meta { display: flex; flex-wrap: wrap; gap: 6px 22px; font-size: 13px; color: #555; margin-bottom: 8px; }
  .summary { background: #f4f6fb; border: 1px solid #d8deec; border-radius: 6px; padding: 10px 14px; margin: 14px 0 22px; }
  .item { border: 1px solid #ddd; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; }
  .item.done { border-left: 4px solid #1f8a4c; background: #f1faf3; }
  .item.pending { border-left: 4px solid #b0b0b0; }
  .item .title-row { display: flex; justify-content: space-between; gap: 14px; }
  .item .status { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #555; white-space: nowrap; }
  .item.done .status { color: #1f8a4c; }
  .item .evidence { margin-top: 6px; font-size: 13px; white-space: pre-wrap; }
  .item .evidence.empty { color: #999; font-style: italic; }
  .item .evidence-screenshot { display: block; max-width: 100%; margin-top: 8px; border: 1px solid #ddd; border-radius: 4px; }
  .print-footer { margin-top: 30px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 11px; color: #777; text-align: center; }
</style>
</head>
<body>
${reportHtml}
</body>
</html>`;

  const blob = new Blob([doc], { type: "text/html" });
  downloadBlob(blob, `qa-growth-report-${name.replace(/\s+/g, "-").toLowerCase()}-${todayIso()}.html`);
}

/* ---------- Utilities ---------- */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}
