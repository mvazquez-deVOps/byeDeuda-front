
/**
 * @fileOverview Schemas and types for the Sales Chat flow.
 * This file does NOT use 'use server' and can safely export non-async objects.
 */

import { z } from 'genkit';

export const SalesChatInputSchema = z.object({
  question: z.string().describe('The question asked by the website visitor.'),
});
export type SalesChatInput = z.infer<typeof SalesChatInputSchema>;
