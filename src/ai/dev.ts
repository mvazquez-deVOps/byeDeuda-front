
import { config } from 'dotenv';
config();

// --- INICIO DE LA CORRECCIÓN DE LA CLAVE PEM ---
// Lee la clave privada del archivo .env
const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';

// Repara el formato de la clave reemplazando los caracteres de escape '\\n' con saltos de línea reales.
const formattedKey = rawKey.replace(/\\n/g, '\n');

// Sobrescribe la variable de entorno con la clave ya formateada.
// Cualquier servicio que se cargue después de este punto (como admin-firebase.ts o genkit.ts)
// leerá la clave en el formato correcto.
process.env.FIREBASE_ADMIN_PRIVATE_KEY = formattedKey;
// --- FIN DE LA CORRECCIÓN DE LA CLAVE PEM ---


import '@/ai/flows/legal-assistant-chat.ts';
import '@/ai/flows/ai-debt-analysis.ts';
import '@/ai/flows/negotiation-simulator-flow.ts';
import '@/ai/flows/support-chat-flow.ts';
import '@/ai/flows/document-analyzer-flow.ts';
import '@/ai/flows/negotiation-dojo-flow.ts';
import '@/ai/flows/negotiation-kit-flow.ts';
import '@/ai/flows/sales-chat-flow.ts';
import '@/ai/flows/schemas/negotiation-kit-schemas.ts';
import '@/ai/flows/schemas/negotiation-dojo-schemas.ts';
import '@/ai/flows/schemas/sales-chat-schemas.ts';


