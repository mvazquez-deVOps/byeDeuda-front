// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  
    apiKey: "AIzaSyBgSCN3okvJwb_QMa1ovVlDcn34d22d3sQ",
    authDomain: "bye-deuda-app-2025.firebaseapp.com",
    projectId: "bye-deuda-app-2025",
    storageBucket: "bye-deuda-app-2025.firebasestorage.app",
    messagingSenderId: "1030511826146",
    appId: "1:1030511826146:web:de8b3afed2049f91d87abb"
  };
  

// Initialize Firebase
// Use a singleton pattern to avoid re-initializing on hot reloads in development
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

export { app, auth, db };
