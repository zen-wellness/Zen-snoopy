import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      console.log("Firebase Admin initialized with service account");
    } else {
      // Fallback for development if no service account is present
      // Note: This might limit some admin capabilities
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      console.log("Firebase Admin initialized without service account (limited access)");
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
