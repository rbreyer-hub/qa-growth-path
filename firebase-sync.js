/* Cloud sync via Firebase (Auth + Firestore) — optional.
 *
 * Local-first: localStorage (handled entirely by app.js) stays the source of
 * truth when signed out or offline. Signing in with Google links this
 * browser's progress to your account and mirrors identity + progress to
 * Firestore at users/{uid}, so the same progress shows up on any device you
 * sign into.
 *
 * Requires firebase-config.js to be filled in with a real project config —
 * see README.md. If it's still the placeholder, sync silently stays off and
 * the app behaves exactly as it did before (localStorage only).
 */

(function () {
  const statusEl = document.getElementById("syncStatus");
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");

  function setStatus(text, kind) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = "sync-status" + (kind ? ` ${kind}` : "");
  }

  const configured =
    typeof firebaseConfig !== "undefined" &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("YOUR_");

  if (!configured) {
    setStatus("Cloud sync not configured — saving to this browser only.");
    if (signInBtn) signInBtn.disabled = true;
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  let unsubscribeSnapshot = null;
  let pushTimer = null;
  let lastPushedJson = null;
  let promptedThisSession = false;

  function syncableSlice(s) {
    return { identity: s.identity, progress: s.progress };
  }

  function pushToFirestore(user) {
    const payload = {
      ...syncableSlice(state),
      version: state.version,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    lastPushedJson = JSON.stringify(syncableSlice(state));
    db.collection("users")
      .doc(user.uid)
      .set(payload, { merge: true })
      .then(() => setStatus(`Synced as ${user.email}`, "synced"))
      .catch((err) => {
        console.error("Firestore write failed:", err);
        setStatus("Sync error — see console. Progress is still saved locally.", "error");
      });
  }

  function schedulePush(user) {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushToFirestore(user), 800);
  }

  function watchRemote(user) {
    unsubscribeSnapshot = db
      .collection("users")
      .doc(user.uid)
      .onSnapshot(
        (snap) => {
          if (snap.metadata.hasPendingWrites) return; // echo of our own write, ignore

          if (!snap.exists) {
            pushToFirestore(user); // first time this account has synced — seed the cloud
            return;
          }

          const remote = snap.data();
          const remoteJson = JSON.stringify(syncableSlice(remote));
          const localJson = JSON.stringify(syncableSlice(state));

          if (remoteJson === localJson || remoteJson === lastPushedJson) {
            setStatus(`Synced as ${user.email}`, "synced");
            return;
          }

          if (!promptedThisSession && hasProgressData(state) && hasProgressData(remote)) {
            promptedThisSession = true;
            const useCloud = confirm(
              "This account has cloud progress, and this browser also has unsynced local progress.\n\n" +
                "OK = load your CLOUD progress (recommended if you've used this tracker elsewhere).\n" +
                "Cancel = keep THIS BROWSER's progress and overwrite the cloud copy."
            );
            if (useCloud) applyRemoteState(remote);
            else pushToFirestore(user);
            return;
          }

          promptedThisSession = true;
          applyRemoteState(remote);
          setStatus(`Synced as ${user.email}`, "synced");
        },
        (err) => {
          console.error("Firestore listen failed:", err);
          setStatus("Sync error — see console. Progress is still saved locally.", "error");
        }
      );
  }

  auth.onAuthStateChanged((user) => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }

    if (user) {
      promptedThisSession = false;
      signInBtn.hidden = true;
      signOutBtn.hidden = false;
      setStatus(`Signed in as ${user.email} — loading cloud progress…`);
      onLocalChange = () => schedulePush(user);
      watchRemote(user);
    } else {
      signInBtn.hidden = false;
      signOutBtn.hidden = true;
      onLocalChange = null;
      setStatus("Progress saved to this browser only. Sign in to sync across devices.");
    }
  });

  signInBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((err) => {
      console.error("Sign-in failed:", err);
      setStatus("Sign-in failed — see console.", "error");
    });
  });

  signOutBtn.addEventListener("click", () => {
    auth.signOut();
  });
})();
