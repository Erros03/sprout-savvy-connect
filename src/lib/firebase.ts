import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
// @ts-expect-error - plain JS config file, intentionally untyped for easy editing
import { firebaseConfig, FIREBASE_ENABLED } from "./firebaseConfig.js";

/**
 * Firebase bootstrap. Everything is lazy and browser-only: the SSR pass never
 * initializes the SDK, so listeners are attached after hydration.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!FIREBASE_ENABLED || typeof window === "undefined") return null;
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getDb(): Database | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    return getDatabase(app);
  } catch (err) {
    console.error("[firebase] Realtime Database unavailable:", err);
    return null;
  }
}

export { FIREBASE_ENABLED };
