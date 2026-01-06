
/**
 * @fileOverview Schemas and types for the Negotiation Kit generation flow.
 * This file does NOT use 'use server' and can safely export non-async objects.
 */

import { z } from 'genkit';

export const GenerateNegotiationKitInputSchema = z.object({
  creditorName: z.string().describe('The name of the creditor.'),
  debtAmount: z.number().describe('The amount of the debt.'),
  daysOverdue: z.number().describe('The number of days the debt is overdue.'),
  collectionType: z.string().describe("The type of collection tactic being used (e.g., 'Acoso telefónico', 'Amenazas de embargo')."),
  evidenceDescription: z.string().describe('A description of what the collection agents are saying or doing.'),
  evidenceImage: z.string().optional().describe("An optional image of a document or message, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateNegotiationKitInput = z.infer<typeof GenerateNegotiationKitInputSchema>;


export const GenerateNegotiationKitOutputSchema = z.object({
  identifiedRegulator: z.enum(['CONDUSEF', 'PROFECO', 'Ninguno']).describe('The government regulator identified for this type of debt (CONDUSEF for financial institutions, PROFECO for commercial stores).'),
  detectedViolations: z.array(z.string()).describe('A list of specific debt collection laws or regulations that may have been violated.'),
  customStrategy: z.array(z.object({
    step: z.number(),
    title: z.string(),
    action: z.string(),
  })).describe('A personalized, step-by-step negotiation strategy.'),
  complaintDraft: z.string().nullable().describe('A pre-written complaint draft for the identified regulator, if any violations were detected. Null otherwise.'),
});
export type GenerateNegotiationKitOutput = z.infer<typeof GenerateNegotiationKitOutputSchema>;
