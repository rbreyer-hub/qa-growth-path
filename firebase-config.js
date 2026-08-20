// Firebase project config — from the Firebase Console:
// Project settings (gear icon) → General → Your apps → SDK setup and configuration → Config.
//
// This is safe to publish/commit: it's a client identifier, not a secret.
// Access is controlled by Firestore security rules and Authentication, not
// by keeping this file private. See README.md for setup steps.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
