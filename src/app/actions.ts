
'use server';

import Stripe from 'stripe';
import { adminAuth } from '@/lib/admin-firebase';
import { analyzeDebtFlow, AnalyzeDebtInput, AnalyzeDebtOutput } from "@/ai/flows/ai-debt-analysis";
import { legalAssistantChatFlow, LegalAssistantChatInput } from "@/ai/flows/legal-assistant-chat";
import { supportChatFlow, SupportChatInput } from "@/ai/flows/support-chat-flow";
import { negotiationSimulatorFlow, NegotiationSimulatorInput, NegotiationSimulatorOutput } from "@/ai/flows/negotiation-simulator-flow";
import { analyzeDocumentFlow, AnalyzeDocumentInput, AnalyzeDocumentOutput } from "@/ai/flows/document-analyzer-flow";
import { tacticalDefenseFlow } from "@/ai/flows/negotiation-dojo-flow";
import type { TacticalDefenseInput, TacticalDefenseOutput } from "@/ai/flows/schemas/negotiation-dojo-schemas";
import { generateNegotiationKitFlow } from "@/ai/flows/negotiation-kit-flow";
import type { GenerateNegotiationKitInput, GenerateNegotiationKitOutput } from "@/ai/flows/schemas/negotiation-kit-schemas";
import { salesChatFlow } from "@/ai/flows/sales-chat-flow";
import type { SalesChatInput } from "@/ai//flows/schemas/sales-chat-schemas";
import { localLawsContext } from "@/lib/local-laws";
import type { Notification, FinancialProfile, ChatThread, ChatMessage, EducationalResource, UserRole } from "@/lib/types";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { educationalResources } from '@/lib/educational-resources';
import { revalidatePath } from "next/cache";

// --- AI FLOWS ---

export async function interactWithSalesBot(userInput: string): Promise<string> {
  try {
    const input: SalesChatInput = { question: userInput };
    return await salesChatFlow(input);
  } catch (error) {
    console.error("Error in interactWithSalesBot Server Action:", error);
    return "Lo siento, mi sistema está teniendo un problema en este momento. Por favor, intenta registrarte gratis para obtener una respuesta de nuestros expertos.";
  }
}

export async function legalAssistantChat(userInput: string): Promise<string> {
  try {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) throw new Error("Authentication required.");

    const input: LegalAssistantChatInput = {
      question: userInput,
    };
    return await legalAssistantChatFlow(input);
  } catch (error) {
    console.error("Error in legalAssistantChat Server Action:", error);
    return "Lo siento, ocurrió un error al conectar con el asistente de IA. Por favor, intenta de nuevo más tarde.";
  }
}

export async function supportChat(userInput: string): Promise<string> {
  try {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) throw new Error("Authentication required.");
    const input: SupportChatInput = { question: userInput };
    return await supportChatFlow(input);
  } catch (error) {
    console.error("Error in supportChat Server Action:", error);
    return "Lo siento, ocurrió un error con nuestro soporte de IA. Por favor, intenta de nuevo o contacta a un agente humano.";
  }
}

export async function analyzeDebt(debtInput: AnalyzeDebtInput): Promise<AnalyzeDebtOutput> {
    // MOCK IMPLEMENTATION - Returns a fake analysis to allow the frontend to work.
    console.warn("ADVERTENCIA: La función analyzeDebt está usando datos simulados (mock).");
    return {
      riskAssessment: {
        riskLevel: 'medium',
        riskScore: 65,
        explanation: 'Análisis simulado: El riesgo es moderado debido al tiempo de atraso. Se recomienda iniciar contacto pronto.',
      },
      negotiationStrategy: {
        step1: 'Paso 1 (simulado): Validar la deuda por escrito.',
        step2: 'Paso 2 (simulado): Acumular un fondo de ahorro para negociar.',
        step3: 'Paso 3 (simulado): Presentar una oferta de pago único.',
      },
    };
}

export async function generateNegotiationKit(input: GenerateNegotiationKitInput): Promise<GenerateNegotiationKitOutput> {
     try {
        return await generateNegotiationKitFlow(input);
    } catch (error: any) {
        console.error("Error in generateNegotiationKit Server Action:", error);
        throw new Error("La IA no pudo generar el kit. Por favor, intenta de nuevo.");
    }
}

export async function simulateNegotiation(input: NegotiationSimulatorInput): Promise<NegotiationSimulatorOutput> {
    try {
        return await negotiationSimulatorFlow(input);
    } catch (error: any) {
        console.error("Error in simulateNegotiation Server Action:", error);
        throw new Error("La IA no pudo procesar la simulación. Por favor, intenta de nuevo.");
    }
}

export async function analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentOutput> {
     try {
        return await analyzeDocumentFlow(input);
    } catch (error: any) {
        console.error("Error in analyzeDocument Server Action:", error);
        throw new Error("La IA no pudo analizar el documento. Por favor, asegúrate de que la imagen sea clara.");
    }
}

export async function generateTacticalDefense(input: TacticalDefenseInput): Promise<TacticalDefenseOutput> {
    try {
        return await tacticalDefenseFlow(input);
    } catch (error: any) {
        console.error("Error in generateTacticalDefense Server Action:", error);
        throw new Error("La IA no pudo generar la defensa. Por favor, intenta de nuevo.");
    }
}


// --- NOTIFICATIONS & CHAT ---

export async function getNotifications(): Promise<Notification[]> {
  console.warn("getNotifications is temporarily disabled.");
  return [];
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: true }> {
  console.warn("markNotificationAsRead is temporarily disabled.");
  return { success: true };
}

export async function getChatThreadsForAdmin(): Promise<ChatThread[]> {
  console.warn("getChatThreadsForAdmin is temporarily disabled.");
  return [];
}

export async function getUserChatThread(): Promise<ChatThread | null> {
    console.warn("getUserChatThread is temporarily disabled.");
    return null;
}

export async function sendChatMessage(data: {
    threadId: string;
    content: string;
}) {
    throw new Error("La función de enviar mensaje está temporalmente deshabilitada.");
}


export async function markThreadAsReadForRole(threadId: string, role: 'user' | 'agent' | 'superadmin') {
    console.warn("markThreadAsReadForRole is temporarily disabled.");
}

// --- IMPERSONATION ---
export async function startImpersonation(targetUserId: string, targetUserName: string) {
    cookies().set('impersonate-user-id', targetUserId, { httpOnly: true, path: '/' });
    cookies().set('impersonate-user-name', targetUserName, { httpOnly: true, path: '/' });
    redirect('/dashboard');
}

export async function stopImpersonation() {
    cookies().delete('impersonate-user-id');
    cookies().delete('impersonate-user-name');
    redirect('/admin');
}


// --- PUBLIC & CONTENT STUDIO ACTIONS ---

export async function getAllResourcesForAdmin(): Promise<EducationalResource[]> {
    console.warn("getAllResourcesForAdmin is temporarily disabled. Returning static data.");
    return educationalResources.filter(r => r.status === 'published');
}

export async function getResourceBySlugForAdmin(slug: string): Promise<EducationalResource | null> {
    console.warn("getResourceBySlugForAdmin is temporarily disabled. Returning static data.");
    const resource = educationalResources.find((r) => r.slug === slug);
    return resource || null;
}

export async function upsertResource(data: EducationalResource): Promise<{ success: boolean; message: string; slug: string }> {
    throw new Error("La gestión de contenido está temporalmente deshabilitada.");
}

export async function deleteResource(id: string): Promise<{ success: boolean; message: string }> {
    throw new Error("La gestión de contenido está temporalmente deshabilitada.");
}
