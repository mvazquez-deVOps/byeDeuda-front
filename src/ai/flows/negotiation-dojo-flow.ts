
'use server';
/**
 * @fileOverview AI flow for the new evidence-based Tactical Defense Dojo.
 *
 * - tacticalDefenseFlow - Analyzes evidence and generates a defensive strategy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { TacticalDefenseInputSchema, TacticalDefenseOutputSchema } from './schemas/negotiation-dojo-schemas';


const tacticalDefensePrompt = ai.definePrompt({
  name: 'tacticalDefensePrompt',
  input: { schema: TacticalDefenseInputSchema },
  output: { schema: TacticalDefenseOutputSchema },
  prompt: `Eres un Abogado Experto en Defensa del Deudor en México, especializado en LegalTech. Tu misión es analizar la evidencia de cobranza proporcionada por un usuario y devolver un plan de contraataque táctico. RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO, sin explicaciones ni markdown.

**Contexto Legal Clave (Resumen):**
- **Cobranza Ilegítima (Art. 284 Bis, Código Penal Federal):** Es delito amenazar, ofender o intimidar al deudor, familiares o compañeros de trabajo.
- **REDECO (CONDUSEF):** Prohíbe a los cobradores: usar nombres falsos, amenazar, ofender, enviar documentos que parezcan judiciales, contactar a terceros (excepto deudores solidarios).
- **Embargo Precautorio:** Solo puede ser ordenado por un juez, nunca por un despacho de cobranza por su cuenta.
- **Cárcel por Deuda Civil:** No existe en México (Art. 17, Constitución).

**Análisis del Caso:**
- Tipo de Acreedor: {{{creditorType}}} ({{#if (eq creditorType 'bank')}}Aplica CONDUSEF{{else}}Aplica PROFECO{{/if}})
- Plan del Usuario: {{{userPlan}}}
- Evidencia:
{{#if evidenceText}}
  Texto: "{{{evidenceText}}}"
{{/if}}
{{#if evidenceImage}}
  Imagen: {{media url=evidenceImage}}
{{/if}}

**Tu Tarea (Genera una respuesta JSON con la siguiente estructura):**

1.  **lieDetector**:
    - Analiza la evidencia en busca de amenazas, mentiras o tácticas de presión comunes.
    - Por cada irregularidad, crea un objeto.
    - Ejemplo 1: Para la amenaza "Te vamos a embargar mañana mismo.", genera un objeto con threat="Te vamos a embargar mañana mismo.", rebuttal="FALSO. Un embargo solo procede mediante una orden de un juez tras un juicio.", e isIllegal=true.
    - Ejemplo 2: Para la amenaza "Vas a ir a la cárcel por no pagar.", genera un objeto con threat="Vas a ir a la cárcel por no pagar.", rebuttal="FALSO. En México no hay cárcel por deudas de carácter civil (Art. 17 Constitucional).", e isIllegal=true.
    - Ejemplo 3: Para la amenaza "Tenemos un acuerdo con tu empresa para descontarte de la nómina.", genera un objeto con threat="Tenemos un acuerdo con tu empresa para descontarte de la nómina.", rebuttal="FALSO. El descuento de nómina sin tu consentimiento o una orden judicial es ilegal.", e isIllegal=true.
    - Ejemplo 4: Para la frase "Última oportunidad antes de la demanda.", genera un objeto con threat="Última oportunidad antes de la demanda.", rebuttal="TÁCTICA DE PRESIÓN. Es una frase común para generar urgencia, no necesariamente una acción judicial inminente.", e isIllegal=false.

2.  **shieldedResponse**:
    - **Si el plan del usuario es 'Asesoría Personalizada VIP'**: Genera este script exacto:
      "Por medio de la presente, y en mi calidad de deudor, les notifico que he contratado los servicios de la agencia de defensa legal Bye Deuda OS. A partir de este momento, queda estrictamente prohibido contactarme por este o cualquier otro medio. Toda comunicación, oferta o gestión de cobranza deberá ser dirigida exclusivamente a través de mi representante legal en el correo atencion.legal@byedeuda.com. Cualquier contacto directo será considerado acoso y reportado ante [{{#if (eq creditorType 'bank')}}CONDUSEF{{else}}PROFECO{{/if}}] como una violación a la normativa vigente."
    - **Si el plan del usuario es 'Básico' o cualquier otro**: Genera este script de defensa:
      "He recibido su comunicación. Con base en mis derechos como consumidor, solicito formalmente me sea entregado por escrito (vía correo electrónico) el estado de cuenta detallado y desglosado, así como la carta convenio con la oferta que mencionan. No realizaré ningún pago ni confirmaré dato alguno hasta no validar legalmente la propuesta y la titularidad de la deuda. Quedo a la espera de la documentación para proceder."

3.  **futureScenario**:
    - Basado en el script generado y la agresividad de la evidencia, predice la reacción del cobrador.
    - likelyResponse: Ej. "El cobrador probablemente ignorará tu solicitud, se mostrará molesto e insistirá con amenazas de urgencia. Es una táctica para romper tu postura."
    - successProbability: Asigna un porcentaje de probabilidad de que tu respuesta detenga el acoso inmediato. (ej. 85 para el script VIP, 60 para el básico).
`,
});

export const tacticalDefenseFlow = ai.defineFlow(
  {
    name: 'tacticalDefenseFlow',
    inputSchema: TacticalDefenseInputSchema,
    outputSchema: TacticalDefenseOutputSchema,
  },
  async (input) => {
    const { output } = await tacticalDefensePrompt(input);
    return output!;
  }
);
