
import { initializeApp, getApps, getApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Esta clave ahora se lee después de haber sido reparada en `src/ai/dev.ts`.
const serviceAccount: ServiceAccount = {
  projectId: "bye-deuda-app-2025",
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!,
};

// Inicialización controlada
let app;
if (!getApps().length) {
    if (!serviceAccount.privateKey || !serviceAccount.privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error("La FIREBASE_ADMIN_PRIVATE_KEY no está definida o no pudo ser cargada correctamente.");
    }
    app = initializeApp({ credential: cert(serviceAccount) });
} else {
    app = getApp();
}

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

export { adminDb, adminAuth };
