# QA Growth Tracker — L2 → L3

A small static web app for tracking progress against the **QA Analyst Level 3** expectations defined in the Patriot Software PDD Confluence space, with proof/evidence capture for each criterion.

The L2 expectations are shown as context (your current role) and the Senior QA Analyst expectations as a longer-term preview.

## Use

Open `index.html` in any modern browser, or visit the GitHub Pages URL.

- Tick each L3 expectation as you complete it.
- Capture evidence (tickets, training sessions, PRs, etc.) in the notes box for each item.
- Progress is saved automatically to your browser's `localStorage`.
- Optionally, sign in (top of the page) to sync progress to your Google account so it follows you across browsers/devices — see **Cloud sync setup** below.

## Cloud sync setup (optional, one-time)

By default progress only lives in the current browser's `localStorage`. To sync it to your account via Firebase:

1. **Create a Firebase project.**
   Go to [console.firebase.google.com](https://console.firebase.google.com) → *Add project* → follow the prompts (Google Analytics is optional, skip it if you don't need it).

2. **Register a web app.**
   In the project overview, click the `</>` (web) icon → give it a nickname (e.g. "QA Growth Tracker") → *Register app*. You don't need Firebase Hosting for this — the app already lives on GitHub Pages. Copy the `firebaseConfig` object it shows you.

3. **Paste the config into `firebase-config.js`.**
   Replace the placeholder values in this repo's `firebase-config.js` with the real ones from step 2. This file is safe to commit — it's a client identifier, not a secret; access is controlled by sign-in + security rules, not by hiding this file.

4. **Enable Google sign-in.**
   In the Firebase console: *Build → Authentication → Get started → Sign-in method → Google → Enable → Save.*

5. **Create a Firestore database.**
   *Build → Firestore Database → Create database* → start in production mode → pick a region.

6. **Apply the security rules.**
   In *Firestore Database → Rules*, replace the contents with what's in this repo's `firestore.rules`, then *Publish*. This restricts each signed-in user to reading/writing only their own progress document.

7. **Add your GitHub Pages domain to the authorized domains list.**
   *Authentication → Settings → Authorized domains* → add `rbreyer-hub.github.io` (it's usually there by default for `*.web.app`/`*.firebaseapp.com`, but the Pages domain needs adding explicitly).

8. **Commit and push** the updated `firebase-config.js`, then reload the GitHub Pages site. You should see a "Sign in with Google" button; once signed in, progress mirrors to Firestore automatically, and the same account will pull that progress into any other browser/device you sign into.

If `firebase-config.js` is left with placeholder values, the sign-in button is disabled and the app works exactly as before (localStorage only) — nothing else in the app depends on Firebase.

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

By default, all data stays in your browser's `localStorage` and nothing is sent to any server. If you opt into cloud sync (see above), your identity fields and progress/notes are sent to your own Firebase project's Firestore database, readable only by your signed-in Google account (enforced by `firestore.rules`) — no one else's data is stored there, and no one else can read yours. The Export buttons still produce files locally on your machine — share them deliberately.
