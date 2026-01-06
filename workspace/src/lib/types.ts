

import type { AnalyzeDebtOutput } from "@/ai/flows/ai-debt-analysis";
import type { GenerateNegotiationKitOutput } from "@/ai/flows/schemas/negotiation-kit-schemas";
import { Timestamp } from "firebase/firestore";

// Renamed to avoid conflict with the new AnalyzeDocumentOutput
export type LegacyDebtAnalysis = AnalyzeDebtOutput;

// The new output type from our document analyzer flow
export type AnalyzeDocumentOutput = {
  documentType: string;
  creditorName: string;
  extractedAmount: number | null;
  isRealThreat: boolean;
  summary: string;
  riskLabel: 'Riesgo Alto' | 'Faltan Datos' | 'Segura para Pagar';
  extractedText: string;
};

export type UserRole = 'superadmin' | 'agent' | 'user';

export type FinancialProfile = {
  monthlyIncome: number;
  livingExpenses: number;
  assetsRisk: 'high' | 'medium' | 'none';
  immediateCapital: number;
  strategyIntent: 'stall' | 'pay_now' | 'monthly_payments';
  solvencyStatus: 'insolvent' | 'liquid';
  paymentCapacity: number;
};

export type User = {
  id?: string;
  uid: string;
  name?: string;
  email: string;
  phone?: string;
  debtRange?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: Timestamp | string;
  plan?: string;
  financialProfile?: FinancialProfile;
  // Aggregated fields for CRM
  totalDebt?: number;
  debtCount?: number;
  highPriority?: boolean;
};

export type DebtStatus = 'overdue' | 'in_negotiation' | 'resolved' | 'pending_analysis';
export type NegotiationStage = 
  | 'analysis_validation' 
  | 'strategic_saving' 
  | 'negotiation_table' 
  | 'formal_offer' 
  | 'legal_review' 
  | 'settlement_freedom';

export type Debt = {
  id: string;
  userId: string;
  creditorName: string;
  creditorLogoId?: string;
  amount: number;
  daysOverdue: number;
  status: DebtStatus;
  analysis?: LegacyDebtAnalysis; // Legacy analysis
  negotiationKit?: GenerateNegotiationKitOutput; // New defense kit
  negotiationStatus?: NegotiationStage;
  negotiationProgress?: number;
  createdAt?: Timestamp;
  // Calculated fields for projection
  currentDaysOverdue?: number;
  estimatedInterest?: number;
  currentAmount?: number;
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
};

export type CommunityPostCategory = 'Tarjetas de Crédito' | 'Préstamos Personales' | 'Automotriz' | 'Apps y Montadeudas' | 'Hipotecario';
export type UserPlan = 'Básico' | 'Plan Libertad Total' | 'Asesoría Personalizada VIP';

export type AiAnalysis = {
    status: 'safe' | 'flagged';
    warningMessage?: string;
    expertAdvice: string;
};

export type CommunityPost = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    authorPlan: UserPlan;
    category: CommunityPostCategory;
    content: string;
    createdAt: Timestamp;
    likes: number;
    aiAnalysis?: AiAnalysis;
};

export type NotificationType = 'info' | 'success' | 'warning';

export type Notification = {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Timestamp;
    link?: string;
};

// --- Bidirectional Chat Types ---
export type ChatThread = {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    lastMessage: string;
    lastSenderId: string;
    updatedAt: Date; // Changed to Date for serializability
    unreadByUser: number;
    unreadByAdmin: number;
}

export type ChatMessage = {
    id: string;
    threadId: string;
    senderId: string;
    senderRole: 'user' | 'agent' | 'superadmin' | 'system';
    content: string;
    createdAt: Date; // Changed to Date for serializability
}


// --- Negotiation Dojo Types ---
export type DojoMessage = {
  id: string;
  sender: 'user' | 'opponent' | 'coach';
  content: string;
  feedback?: {
    assessment: 'strong' | 'weak' | 'neutral';
    suggestion?: string;
  };
  timestamp: string;
};

export type NegotiationSession = {
  id: string;
  userId: string;
  linkedDocumentId?: string;
  creditorContext: string;
  transcript: DojoMessage[];
  finalScore: number;
  feedbackSummary: string;
  createdAt: Timestamp;
};

// --- Public Educational Resources / Content Studio ---
export type EducationalResource = {
  id: string;
  title: string;
  slug: string;
  type: 'article' | 'podcast' | 'video' | 'script' | 'template' | 'guide' | 'tool';
  status: 'draft' | 'published';
  content: string; // Markdown or HTML
  mediaUrl?: string; // e.g., Spotify or YouTube embed link
  image: string;
  imageHint: string;
  description: string;
  isPremium: boolean;
  createdAt: string; // ISO 8601 date string
};
