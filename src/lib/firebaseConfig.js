// Firebase web app credentials (publishable — safe in client code).
// Firebase console -> Project settings -> Your apps -> SDK setup and configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBwcSGJbzKIpsdT4lbCDlc4zjaJ0nfSnL4",
  authDomain: "blightdetect-4b3a6.firebaseapp.com",
  // Realtime Database URL. If your RTDB was created in a non-US region, copy the
  // exact URL from Firebase console -> Realtime Database (e.g.
  // https://blightdetect-4b3a6-default-rtdb.asia-southeast1.firebasedatabase.app)
  databaseURL: "https://blightdetect-4b3a6-default-rtdb.firebaseio.com",
  projectId: "blightdetect-4b3a6",
  storageBucket: "blightdetect-4b3a6.firebasestorage.app",
  messagingSenderId: "1066685062595",
  appId: "1:1066685062595:web:01aa70fbd4d12bff417176",
  measurementId: "G-JZL006NZ8L",
};

// Live Firebase Realtime Database is on. Set to false to fall back to the
// built-in mock detection stream (useful for offline demos).
export const FIREBASE_ENABLED = true;
