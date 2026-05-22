# QA Growth Tracker — L2 → L3

A small static web app for tracking progress against the **QA Analyst Level 3** expectations defined in the Patriot Software PDD Confluence space, with proof/evidence capture for each criterion.

The L2 expectations are shown as context (your current role) and the Senior QA Analyst expectations as a longer-term preview.

## Use

Open `index.html` in any modern browser, or visit the GitHub Pages URL.

- Tick each L3 expectation as you complete it.
- Capture evidence (tickets, training sessions, PRs, etc.) in the notes box for each item.
- Progress is saved automatically to your browser's `localStorage`.

## Export for your manager

Open the **Export / Tools** tab:

- **Print / Save as PDF** — generates a clean single-document report and opens the browser print dialog. Pick "Save as PDF" to attach to an email or share in a 1:1.
- **Download standalone HTML** — same report as a self-contained `.html` file you can email.
- **Export JSON** — full backup of identity + progress for moving between machines.
- **Import JSON** — restore from a previous backup.

## Source

Role definitions are mirrored from Confluence pages last synced **2026-05-22**:

- [QA Analyst Level 2](https://patriotsoftware.atlassian.net/wiki/spaces/PDD/pages/4622942209/QA+Analyst+Level+2)
- [QA Analyst Level 3](https://patriotsoftware.atlassian.net/wiki/spaces/PDD/pages/4622974977/QA+Analyst+Level+3)
- [Senior QA Analyst](https://patriotsoftware.atlassian.net/wiki/spaces/PDD/pages/4622974987/Senior+QA+Analyst)

If those pages change, update `data.js`.

## Privacy

All data stays in your browser's `localStorage`. Nothing is sent to any server. The Export buttons produce files locally on your machine — share them deliberately.
