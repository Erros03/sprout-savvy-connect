import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
// @ts-expect-error - plain JS config file, intentionally untyped for easy editing
import { firebaseConfig, FIREBASE_ENABLED } from "./firebaseConfig.js";

/**
 * Basic Firebase bootstrap. While FIREBASE_ENABLED is false the app runs on the
 * mock data stream in `useBlightStream`. Once you paste real credentials into
 * firebaseConfig.js and set FIREBASE_ENABLED = true, swap the mock generators
 * for onValue()/onSnapshot() listeners.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!FIREBASE_ENABLED) return null;
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export { FIREBASE_ENABLED };
