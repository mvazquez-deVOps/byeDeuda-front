
/**
 * @fileOverview Negotiation scenario simulator AI agent.
 *
 * - negotiationSimulatorFlow - The Genkit flow that analyzes a debt scenario and provides a predictive outcome.
 * - NegotiationSimulatorInput - The input type for the negotiationSimulatorFlow.
 * - NegotiationSimulatorOutput - The return type for the negotiationSimulatorFlow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const NegotiationSimulatorInputSchema = z.object({
  debtType: z.string().describe('El tipo de deuda (Tarjeta de Crédito, Hipotecario, Automotriz, Préstamo Personal).'),
  contactedBy: z.string().describe('Quién está contactando al deudor (El banco original, Un despacho de cobranza, Un despacho de abogados).'),
});
export type NegotiationSimulatorInput = z.infer<typeof NegotiationSimulatorInputSchema>;

export const NegotiationSimulatorOutputSchema = z.object({
    urgencyLevel: z.enum(['Baja', 'Media', 'Alta']).describe('El nivel de urgencia de la situación.'),
    likelyOutcome: z.string().describe('Un resumen de las posibles consecuencias si no se actúa.'),
    recommendedFirstStep: z.string().describe('La primera acción más importante que el usuario debe tomar.'),
});
export type NegotiationSimulatorOutput = z.infer<typeof NegotiationSimulatorOutputSchema>;


const negotiationSimulatorPrompt = ai.definePrompt({
  name: 'negotiationSimulatorPrompt',
  input: {schema: NegotiationSimulatorInputSchema},
  output: {schema: NegotiationSimulatorOutputSchema},
  prompt: `Eres un experto en negociación de deudas y debes responder siempre en español. Tu propósito es analizar un escenario de deuda y predecir el resultado más probable, así como la acción recomendada.

Escenario:
- Tipo de Deuda: {{{debtType}}}
- Contactado por: {{{contactedBy}}}

Basado en este escenario, evalúa el nivel de urgencia, describe las consecuencias más probables si no se toma acción, y proporciona un primer paso claro y accionable para el usuario.

El tono debe ser directo, realista pero tranquilizador, enfocándote en empoderar al usuario con conocimiento.

Proporciona la respuesta en el formato JSON especificado.`,
});

export const negotiationSimulatorFlow = ai.defineFlow(
  {
    name: 'negotiationSimulatorFlow',
    inputSchema: NegotiationSimulatorInputSchema,
    outputSchema: NegotiationSimulatorOutputSchema,
  },
  async input => {
    const {output} = await negotiationSimulatorPrompt(input);
    return output!;
  }
);
