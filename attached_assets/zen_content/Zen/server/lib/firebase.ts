import admin from 'firebase-admin';

// Initialize Firebase Admin
let db: admin.firestore.Firestore | undefined;

// On Replit, we use the Admin SDK with project ID only for certain operations,
// but for Firestore it REQUIRES a service account.
// To bypass this for now and allow the app to run without crashing, 
// we'll only initialize Firestore if we have a service account, 
// otherwise we'll fall back gracefully.

if (process.env.VITE_FIREBASE_PROJECT_ID) {
  try {
    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    }
    // We don't initialize Firestore here because it crashes without a service account
    // instead we let the storage layer handle the fallback
    console.log("Firebase Admin (App Only) initialized for project:", process.env.VITE_FIREBASE_PROJECT_ID);
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export { db };
