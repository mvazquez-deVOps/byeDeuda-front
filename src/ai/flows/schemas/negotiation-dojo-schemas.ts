
/**
 * @fileOverview Schemas and types for the Tactical Defense Dojo flow.
 * This file does NOT use 'use server' and can safely export non-async objects.
 */

import { z } from 'genkit';

export const TacticalDefenseInputSchema = z.object({
  evidenceText: z.string().optional().describe('El texto de la comunicación del cobrador (ej. chat de WhatsApp).'),
  evidenceImage: z.string().optional().describe("Una imagen de la comunicación (ej. captura de pantalla, carta), como data URI. Formato: 'data:<mimetype>;base64,<data>'."),
  creditorType: z.enum(['bank', 'store']).describe("El tipo de acreedor: 'bank' para instituciones financieras (bancos, SOFOMs) o 'store' para comercios (tiendas departamentales, apps no reguladas)."),
  userPlan: z.string().describe("El plan de suscripción del usuario (ej. 'Básico', 'Asesoría Personalizada VIP')."),
});
export type TacticalDefenseInput = z.infer<typeof TacticalDefenseInputSchema>;

export const TacticalDefenseOutputSchema = z.object({
  lieDetector: z.array(z.object({
    threat: z.string().describe('La amenaza o declaración falsa identificada en el texto.'),
    rebuttal: z.string().describe('La corrección legal y el artículo que la sustenta. Ej: "Falso. El embargo solo procede con orden judicial."'),
    isIllegal: z.boolean().describe('Indica si la táctica es una práctica de cobranza ilegal.'),
  })).describe('Una lista de las irregularidades y mentiras detectadas en la comunicación.'),

  shieldedResponse: z.string().describe('El script exacto, listo para copiar y pegar, que el usuario debe enviar como respuesta.'),

  futureScenario: z.object({
    likelyResponse: z.string().describe('La respuesta más probable que dará el cobrador al recibir el script.'),
    successProbability: z.number().min(0).max(100).describe('La probabilidad de éxito de la respuesta (0-100).'),
  }).describe('La predicción de la IA sobre el siguiente movimiento del cobrador.'),
});
export type TacticalDefenseOutput = z.infer<typeof TacticalDefenseOutputSchema>;
