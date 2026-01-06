import { adminDb } from './admin-firebase';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai'; 
import { FieldValue } from 'firebase-admin/firestore';

export async function indexDocument(content: string, source: string, type: string = 'general') {
  try {
    // 1. Generar el vector (embedding) usando Gemini
    const embedding = await ai.embed({
      embedder: googleAI.embedder('text-embedding-004'),
      content: content,
    });

    // 2. Guardar en Firestore con el vector
    await adminDb.collection('knowledge_base').add({
      content,
      metadata: { source, type },
      // OJO: Si FieldValue.vector te marca error, asegúrate de tener firebase-admin actualizado
      // Si sigue en rojo, podrías probar: FieldValue.vector(embedding) as any
      embedding: FieldValue.vector(embedding), 
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error indexando documento:", error);
    return { success: false, error };
  }
}
