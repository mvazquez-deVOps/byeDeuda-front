
'use server';

import { collection, addDoc, serverTimestamp, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from './init-firebase';
import type { LegacyDebtAnalysis } from '@/lib/types';

interface DebtData {
  userId: string;
  creditorName: string;
  amount: number;
  daysOverdue: number;
  analysis: LegacyDebtAnalysis;
}

/**
 * Creates a new debt document and a corresponding notification in Firestore.
 * @param {DebtData} debtData - The data for the new debt.
 * @returns {Promise<string>} The ID of the newly created debt document.
 */
export async function createDebt(debtData: DebtData): Promise<string> {
  if (!debtData.userId) {
    throw new Error('User ID is required to create a debt.');
  }

  const batch = writeBatch(db);

  // 1. Reference to the new debt document (to get an ID)
  const newDebtRef = doc(collection(db, 'users', debtData.userId, 'debts'));
  
  const newDebt = {
    creditorName: debtData.creditorName,
    amount: debtData.amount,
    daysOverdue: debtData.daysOverdue,
    analysis: debtData.analysis, // Store the basic analysis
    status: 'pending_analysis', // Start with a more neutral status
    negotiationStatus: 'analysis_validation',
    negotiationProgress: 5, // Lower progress for basic analysis
    creditorLogoId: `${debtData.creditorName.toLowerCase().replace(/\s/g, '-')}-logo`,
    createdAt: serverTimestamp() as Timestamp,
  };
  batch.set(newDebtRef, newDebt);
  
  // 2. Reference and data for the new notification
  const notificationRef = doc(collection(db, 'users', debtData.userId, 'notifications'));
  const notificationData = {
    userId: debtData.userId,
    type: 'success',
    title: '¡Deuda Registrada!',
    message: `Tu deuda con ${debtData.creditorName} ha sido registrada y analizada. Revisa tu dashboard para ver el diagnóstico.`,
    isRead: false,
    createdAt: serverTimestamp() as Timestamp,
    link: `/dashboard/debt/${newDebtRef.id}`,
  };
  batch.set(notificationRef, notificationData);

  try {
    await batch.commit();
    console.log('Debt document and notification created with ID:', newDebtRef.id);
    return newDebtRef.id;
  } catch (error) {
    console.error('Error creating debt and notification:', error);
    throw new Error('Could not create debt and notification.');
  }
}
