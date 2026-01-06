
/**
 * @fileOverview Document analysis AI agent that assesses legal documents for threats and extracts key information.
 *
 * - analyzeDocumentFlow - The Genkit flow that analyzes a document image.
 * - AnalyzeDocumentInput - The input type for the analyzeDocumentFlow.
 * - AnalyzeDocumentOutput - The return type for the analyzeDocumentFlow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeDocumentInputSchema = z.object({
  documentImage: z
    .string()
    .describe(
      "A photo of a legal or collection document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentInputSchema>;

export const AnalyzeDocumentOutputSchema = z.object({
  documentType: z.string().describe('El tipo de documento (ej. Carta de Cobranza, Notificación Extrajudicial, Carta Convenio).'),
  creditorName: z.string().describe('El nombre del acreedor o despacho de cobranza que envía el documento.'),
  extractedAmount: z.number().nullable().describe('El monto monetario principal que se menciona en el documento (el monto a pagar), si existe.'),
  isRealThreat: z.boolean().describe('Determina si el documento representa una amenaza legal real (ej. una demanda judicial) o una táctica de presión.'),
  summary: z.string().describe('Un resumen claro y conciso de lo que significa el documento y qué debe hacer el usuario.'),
  riskLabel: z.enum(['Riesgo Alto', 'Faltan Datos', 'Segura para Pagar']).describe("Una etiqueta de clasificación de riesgo para el documento, indicando si es seguro proceder con el pago."),
  extractedText: z.string().describe('El texto completo extraído del documento para análisis contextual posterior.'),
});
export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;


const analyzeDocumentPrompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentInputSchema},
  output: {schema: AnalyzeDocumentOutputSchema},
  prompt: `Eres un abogado experto en deudas y tu única función es analizar documentos de cobranza para un cliente. Tu especialidad es validar **Cartas Convenio** para determinar si son seguras para pagar. Debes ser directo, claro y responder siempre en español.

Analiza la siguiente imagen de un documento:
{{media url=documentImage}}

Tu tarea es evaluar la imagen y devolver un objeto JSON con la siguiente estructura:
1.  **documentType**: Identifica qué tipo de documento es (ej. 'Carta Convenio', 'Carta de Intención', 'Demanda Judicial').
2.  **creditorName**: Extrae el nombre de la empresa que lo envía.
3.  **extractedAmount**: Extrae el monto a pagar que se menciona en la oferta. Si no hay ninguno, devuelve null.
4.  **isRealThreat**: Evalúa si es una demanda judicial real. Devuelve \`true\` solo si parece un documento emitido por una corte.
5.  **summary**: Explica en términos sencillos qué significa el documento. Si es una Carta Convenio, explica si es segura o no.
6.  **riskLabel**: Asigna una de las siguientes tres etiquetas de semáforo:
    -   **'Riesgo Alto'**: Si es una táctica de miedo, una demanda, o una carta convenio Falsa/Inválida (ej. no menciona 'finiquito', el descuento no es claro, no tiene datos de la empresa, parece un borrador).
    -   **'Faltan Datos'**: Si es una oferta que parece legítima pero le falta información crucial para ser 100% segura (ej. no incluye el nombre completo del deudor, no especifica la cuenta a saldar, o carece de una fecha de vigencia clara).
    -   **'Segura para Pagar'**: Si es una Carta Convenio que cumple con los requisitos: menciona un 'finiquito total', las fechas de pago son futuras, el descuento es matemáticamente correcto, tiene logo y datos de contacto de la empresa.
7.  **extractedText**: Extrae y devuelve todo el texto legible del documento. Esto se usará para análisis posteriores.
`,
});

export const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async input => {
    const {output} = await analyzeDocumentPrompt(input);
    return output!;
  }
);
