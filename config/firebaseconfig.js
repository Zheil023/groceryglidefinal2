// firebaseconfig.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "groceryglide-47d21.firebaseapp.com",
  projectId: "groceryglide-47d21",
  storageBucket: "groceryglide-47d21.appspot.com",
  messagingSenderId: "733383608326",
  appId: "1:733383608326:web:4d35b5a7cbb38ee7275b87",
  measurementId: "G-4D2FQKGGWH",
};

// Initialize Firebase only if it has not been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
