import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBYvXCyFlNDotTAzDEGn1-Srje6QYCYTN8",
  authDomain: "hood-reviews.firebaseapp.com",
  projectId: "hood-reviews",
  storageBucket: "hood-reviews.firebasestorage.app",
  messagingSenderId: "54662494348",
  appId: "1:54662494348:web:9182ac4180fa7d325463a9",
  measurementId: "G-WERJZXS6RB",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
