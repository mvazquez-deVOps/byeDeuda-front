
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración Pública con valores correctos del proyecto
const firebaseConfig = {
  apiKey: "",
  authDomain: "bye-deuda-app-2025.firebaseapp.com",
  projectId: "bye-deuda-app-2025",
  storageBucket: "bye-deuda-app-2025.appspot.com",
  messagingSenderId: "1030511826146",
  appId: "",
  measurementId: "G-XXXXXXXXXX"
};


// Inicialización Singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
