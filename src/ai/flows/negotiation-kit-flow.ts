
'use server';
/**
 * @fileOverview Generates a full defense and negotiation kit for a given debt.
 *
 * - generateNegotiationKitFlow - The Genkit flow that creates the kit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { localLawsContext } from '@/lib/local-laws';
import { GenerateNegotiationKitInputSchema, GenerateNegotiationKitOutputSchema } from './schemas/negotiation-kit-schemas';


const negotiationKitPrompt = ai.definePrompt({
  name: 'negotiationKitPrompt',
  input: { schema: GenerateNegotiationKitInputSchema },
  output: { schema: GenerateNegotiationKitOutputSchema },
  prompt: `Eres un abogado experto en LegalTech y defensa del deudor en México. Tu misión es generar un "Kit de Autogestión y Defensa" completo y personalizado basado en la información del usuario y el contexto legal proporcionado. Siempre debes responder en español.

**Contexto Legal Clave:**
${localLawsContext}

**Información del Caso del Usuario:**
- Acreedor: {{{creditorName}}}
- Monto de Deuda: {{{debtAmount}}} MXN
- Días de Atraso: {{{daysOverdue}}}
- Tácticas de Cobranza Reportadas: {{{collectionType}}}
- Descripción del Usuario: "{{{evidenceDescription}}}"
{{#if evidenceImage}}
- Evidencia Gráfica: {{media url=evidenceImage}}
{{/if}}

**Tu Tarea (Genera una respuesta JSON con el siguiente formato):**

1.  **identifiedRegulator**:
    - Si el acreedor es un banco, SOFOM, o cualquier entidad financiera, asigna 'CONDUSEF'.
    - Si el acreedor es una tienda departamental (Liverpool, Coppel), una app de préstamos no regulada, o una empresa de servicios, asigna 'PROFECO'.
    - Si no aplica, asigna 'Ninguno'.

2.  **detectedViolations**:
    - Compara las tácticas de cobranza reportadas con el contexto legal.
    - Si detectas prácticas ilegales (amenazas, llamadas a deshoras, contacto a terceros, etc.), enlista las violaciones específicas. Ej: ["Comunicación con terceros sobre la deuda.", "Realizar amenazas de acciones no legales (embargo sin juicio)."]. Si no hay violaciones claras, devuelve un array vacío.

3.  **customStrategy**:
    - Crea un plan de acción de 3 a 5 pasos. La estrategia debe ser específica para el acreedor y el nivel de agresividad.
    - **Ejemplo (para cobranza agresiva):**
        - Step 1, Title: "Bloqueo y Comunicación Cero", Action: "No contestes más llamadas. Guarda este script: 'Por recomendación legal, toda comunicación será por escrito. Envíen su propuesta al correo [tu-email]'. Repítelo y cuelga."
        - Step 2, Title: "Solicitud de Estado de Cuenta Formal", Action: "Envía un correo a la UNE del banco solicitando el estado de cuenta detallado para validar el adeudo. Esto formaliza la comunicación."
        - Step 3, Title: "Ahorro Estratégico", Action: "Mientras ganas tiempo, enfócate en reunir al menos el 25% de la deuda. Este será tu fondo de negociación."
        - Step 4, Title: "Iniciar Queja en CONDUSEF", Action: "Usa el borrador de queja generado para registrar un folio en el portal de CONDUSEF. Esto obliga al banco a negociar formalmente."

4.  **complaintDraft**:
    - Si 'detectedViolations' no está vacío, redacta un borrador de queja formal y profesional para el regulador correspondiente.
    - El texto debe ser claro, conciso y relatar los hechos.
    - **Ejemplo (para CONDUSEF):** "Por este medio, presento una queja formal en contra de [Nombre del Acreedor/Despacho] por malas prácticas de cobranza. A pesar de mi disposición a negociar, he sido objeto de [mencionar violaciones, ej: llamadas insistentes a mi lugar de trabajo y amenazas de embargo sin orden judicial], en violación del Artículo X de la Ley para la Transparencia. Adjunto evidencia de [describir evidencia]. Solicito su intervención para que cese el acoso y se establezca un canal de negociación formal."
    - Si no hay violaciones, devuelve \`null\`.
`,
});

export async function generateNegotiationKitFlow(input: z.infer<typeof GenerateNegotiationKitInputSchema>): Promise<z.infer<typeof GenerateNegotiationKitOutputSchema>> {
    const flow = ai.defineFlow(
      {
        name: 'generateNegotiationKitFlow',
        inputSchema: GenerateNegotiationKitInputSchema,
        outputSchema: GenerateNegotiationKitOutputSchema,
      },
      async (flowInput) => {
        const { output } = await negotiationKitPrompt(flowInput);
        return output!;
      }
    );
    
    return await flow(input);
}
