/**
 * @fileOverview Flujo de chat del asistente legal con RAG (Búsqueda Vectorial).
 * Busca contexto relevante en Firestore antes de responder.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/lib/admin-firebase';
import { googleAI } from '@genkit-ai/google-genai';

// 1. Esquema de Entrada
export const LegalAssistantChatInputSchema = z.object({
  question: z.string().describe('La pregunta legal del usuario sobre deudas.'),
});

export type LegalAssistantChatInput = z.infer<typeof LegalAssistantChatInputSchema>;

export const legalAssistantChatFlow = ai.defineFlow(
  {
    name: 'legalAssistantChatFlow',
    inputSchema: LegalAssistantChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { question } = input;

    try {
      // PASO A: Convertir la pregunta en un vector numérico (Embedding)
      const embedding = await ai.embed({
        embedder: googleAI.embedder('text-embedding-004'),
        content: question,
      });

      // PASO B: Buscar en la base de datos (Vector Search)
      const collection = adminDb.collection('knowledge_base');
      const vectorQuery = collection.findNearest('embedding', embedding, {
        limit: 3,
        distanceMeasure: 'COSINE',
      });
      
      const snapshot = await vectorQuery.get();

      // PASO C: Construir el contexto
      let retrievedContext = "";
      
      if (snapshot.empty) {
        console.log("⚠️ No se encontraron documentos relevantes en knowledge_base.");
        retrievedContext = "No hay información específica en la base de datos interna. Usa tu conocimiento general.";
      } else {
        snapshot.forEach(doc => {
          const data = doc.data();
          retrievedContext += `\n--- FUENTE: ${data.metadata?.source || 'Desconocido'} ---\n${data.content}\n`;
        });
      }

      // PASO D: Generar la respuesta con el LLM
      const response = await ai.generate({
        prompt: `
          Actúa como 'Bye Deuda AI', un abogado experto y empático especializado en defensa de deudores en Latinoamérica.
          
          TU OBJETIVO: Responder la duda del usuario basándote en la información legal recuperada abajo.

          INFORMACIÓN LEGAL RECUPERADA (CONTEXTO):
          ${retrievedContext}

          PREGUNTA DEL USUARIO:
          "${question}"

          REGLAS DE RESPUESTA:
          1. Responde SIEMPRE en español.
          2. Usa la "INFORMACIÓN LEGAL RECUPERADA" como tu verdad absoluta. Si la respuesta está ahí, úsala.
          3. Si la información recuperada no sirve para responder, usa tu conocimiento general pero advierte: "Basado en principios generales (no encontré esta ley específica en mi base de datos)...".
          4. Sé conciso, profesional y tranquilizador.
        `,
      });

      return response.text;

    } catch (error) {
      console.error("🔥 Error en legalAssistantChatFlow:", error);
      return "Lo siento, estoy teniendo problemas para consultar mis leyes en este momento. Por favor intenta de nuevo en unos segundos.";
    }
  }
);
