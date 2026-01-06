
/**
 * @fileOverview Support assistant chat flow for answering user questions based on a knowledge base.
 *
 * - supportChatFlow - The Genkit flow that handles the support question and answering process.
 * - SupportChatInput - The input type for the supportChatFlow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SupportChatInputSchema = z.object({
  question: z.string().describe('The support question asked by the user.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;


const prompt = ai.definePrompt({
  name: 'supportChatPrompt',
  input: {schema: SupportChatInputSchema},
  prompt: `
Rol: Eres 'Soporte Bye Deuda', un asistente de IA amigable y eficiente.
Idioma: Debes responder SIEMPRE en Español.

Tu objetivo es resolver la duda del usuario ("Ticket") automáticamente usando tu base de conocimiento. Si no puedes resolverla, tu trabajo es guiar al usuario a la herramienta correcta.

Base de Conocimiento (Contexto):
- Pagos y Suscripción: Para dudas sobre pagos, facturas o gestionar la suscripción, el usuario debe ir a la sección "Suscripción" de su dashboard. Aceptamos transferencias y tarjetas. Los pagos pueden tardar hasta 24 horas en reflejarse.
- Proceso de Negociación: Nuestro proceso tiene etapas claras: Análisis, Ahorro Estratégico, Negociación, y Liquidación. El usuario puede ver el estatus de cada deuda en su "Dashboard" principal.
- Quejas y Molestia Extrema: Si un usuario expresa una gran frustración, enojo o amenaza con acciones legales, tu respuesta debe ser: "Entiendo completamente tu frustración y lamento mucho la situación. Para darte la atención que mereces, por favor escribe directamente a nuestro equipo de liderazgo en hola@byedeuda.com para que revisen tu caso de inmediato."
- Escalado a Ticket/Humano: Si la pregunta es muy compleja, no está en tu base de conocimiento, o si el usuario pide explícitamente hablar con una persona, debes responder: "Gracias por tu pregunta. Para que un agente especializado la revise, por favor abre un 'Nuevo Ticket' en esta misma pantalla. Nuestro equipo se pondrá en contacto contigo a la brevedad."

Pregunta del usuario: {{{question}}}

Respuesta:`,
});

export const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const {text} = await prompt(input);
    return text;
  }
);

    