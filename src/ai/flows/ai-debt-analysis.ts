
/**
 * @fileOverview Debt analysis AI agent that assesses legal risk and provides negotiation strategies.
 *
 * - analyzeDebtFlow - The Genkit flow that analyzes debt.
 * - AnalyzeDebtInput - The input type for the analyzeDebtFlow.
 * - AnalyzeDebtOutput - The return type for the analyzeDebtFlow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeDebtInputSchema = z.object({
  creditorName: z.string().describe('The name of the creditor.'),
  debtAmount: z.number().describe('The amount of the debt.'),
  daysOverdue: z.number().describe('The number of days the debt is overdue.'),
});
export type AnalyzeDebtInput = z.infer<typeof AnalyzeDebtInputSchema>;

export const AnalyzeDebtOutputSchema = z.object({
  riskAssessment: z.object({
    riskLevel: z.enum(['high', 'medium', 'low']).describe('El nivel de riesgo de acción legal.'),
    riskScore: z.number().describe('Un puntaje numérico que representa el riesgo de acción legal (0-100).'),
    explanation: z.string().describe('Explicación de la evaluación de riesgo.'),
  }),
  negotiationStrategy: z.object({
    step1: z.string().describe('Paso 1 de la estrategia de negociación.'),
    step2: z.string().describe('Paso 2 de la estrategia de negociación.'),
    step3: z.string().describe('Paso 3 de la estrategia de negociación.'),
  }).describe('Una estrategia de negociación en 3 pasos para gestionar la deuda.'),
});
export type AnalyzeDebtOutput = z.infer<typeof AnalyzeDebtOutputSchema>;


const analyzeDebtPrompt = ai.definePrompt({
  name: 'analyzeDebtPrompt',
  input: {schema: AnalyzeDebtInputSchema},
  output: {schema: AnalyzeDebtOutputSchema},
  prompt: `Eres un experto en negociación de deudas y debes responder siempre en español. Analiza la siguiente información de la deuda para determinar el riesgo de acción legal y proporciona una estrategia de negociación clara y concisa en 3 pasos.

Nombre del Acreedor: {{{creditorName}}}
Monto de la Deuda: {{{debtAmount}}}
Días de Atraso: {{{daysOverdue}}}

Proporciona la respuesta en el formato JSON especificado.`,
});

export const analyzeDebtFlow = ai.defineFlow(
  {
    name: 'analyzeDebtFlow',
    inputSchema: AnalyzeDebtInputSchema,
    outputSchema: AnalyzeDebtOutputSchema,
  },
  async input => {
    const {output} = await analyzeDebtPrompt(input);
    return output!;
  }
);
