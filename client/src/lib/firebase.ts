import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA8j7_P2N9z1HByP1sL2GWBbQuFJOysWRs",
  authDomain: "sleep-zen-e28b9.firebaseapp.com",
  projectId: "sleep-zen-e28b9",
  storageBucket: "sleep-zen-e28b9.firebasestorage.app",
  messagingSenderId: "546136519002",
  appId: "1:546136519002:web:908b4e759eb6f92bcd8363",
  measurementId: "G-7NMJT2468G"
};

// Debug log to confirm which project is being used
if (typeof window !== "undefined") {
  console.log("Firebase initialized with project:", firebaseConfig.projectId);
  console.log("Current hostname:", window.location.hostname);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
export default app;
