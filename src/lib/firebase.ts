import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGqulhcPy_QJK3xSZ3a3OY6nudkhXcWeI",
  authDomain: "ai-learning-platform-f5a6b.firebaseapp.com",
  projectId: "ai-learning-platform-f5a6b",
  storageBucket: "ai-learning-platform-f5a6b.firebasestorage.app",
  messagingSenderId: "807878924060",
  appId: "1:807878924060:web:f1feb0d6e552cc38db0cd9",
  measurementId: "G-FYCJ9Y9WWG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);