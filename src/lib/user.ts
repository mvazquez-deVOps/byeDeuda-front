
'use server';

import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './init-firebase';
import { auth } from '@/lib/init-firebase';
import { updateProfile } from 'firebase/auth';


interface UserProfileData {
  uid: string;
  email: string | null;
  name: string;
  phone: string;
  debtRange: string;
}

/**
 * Creates a user profile document in Firestore and updates Firebase Auth display name.
 * This is typically called after a new user signs up.
 * @param {UserProfileData} userData - The user data including uid, email and name.
 * @returns {Promise<void>}
 */
export async function createUserProfile(userData: UserProfileData): Promise<void> {
  const userRef = doc(db, 'users', userData.uid);
  const newUserProfile = {
    uid: userData.uid,
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    debtRange: userData.debtRange,
    role: 'user', // Default role for new users
    createdAt: serverTimestamp() as Timestamp,
    plan: 'Básico', // Assign Básico plan on creation
    financialProfile: { // Initialize financial profile
        monthlyIncome: 0,
        livingExpenses: 0,
        assetsRisk: 'none',
        immediateCapital: 0,
        strategyIntent: 'stall',
        solvencyStatus: 'liquid',
        paymentCapacity: 0,
    }
  };

  try {
    // 1. Update Firebase Auth Profile
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
            displayName: userData.name,
        });
    }

    // 2. Create Firestore Document
    await setDoc(userRef, newUserProfile);
    console.log('User profile created and auth displayName updated for UID:', userData.uid);
  } catch (error) {
    console.error('Error creating user profile:', error);
    // You might want to throw the error or handle it as needed
    throw new Error('Could not create user profile.');
  }
}
