import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA8j7_P2N9z1HByP1sL2GWBbQuFJOysWRs",
  authDomain: "zen-task-ec5e5.firebaseapp.com",
  projectId: "zen-task-ec5e5",
  storageBucket: "zen-task-ec5e5.firebasestorage.app",
  messagingSenderId: "546136519002",
  appId: "1:546136519002:web:908b4e759eb6f92bcd8363",
  measurementId: "G-7NMJT2468G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Firebase persistence error:", err);
});

export const db = getFirestore(app);
export default app;
