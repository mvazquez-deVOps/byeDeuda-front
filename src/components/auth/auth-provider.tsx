
'use client';

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/init-firebase';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  role: 'user',
});

// Function to set session cookie - This will be called from the login page explicitly
export async function setSessionCookie(firebaseUser: FirebaseUser | null) {
  if (firebaseUser) {
    const idToken = await firebaseUser.getIdToken();
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error('Failed to set session cookie:', error);
    }
  } else {
     try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to clear session cookie:', error);
    }
  }
}


export function AuthProvider({ 
  children, 
  impersonatedUserId 
}: { 
  children: React.ReactNode, 
  impersonatedUserId?: string 
}) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('user');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setLoading(true);
      if (!currentFirebaseUser) {
        setFirebaseUser(null);
        setUser(null);
        setRole('user');
        // No need to clear cookie here, logout flow should handle it
        setLoading(false);
        return;
      }
      
      setFirebaseUser(currentFirebaseUser);

      const userIdToFetch = impersonatedUserId || currentFirebaseUser.uid;

      // Listen to the document of the user being displayed (real or impersonated)
      const unsubscribeUserDoc = onSnapshot(doc(db, 'users', userIdToFetch), (userDoc) => {
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), uid: userIdToFetch } as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error on user snapshot listener:", error);
        setUser(null);
        setLoading(false);
      });

      // Always determine the role from the REAL logged-in user to maintain permissions
      const unsubscribeAdminDoc = onSnapshot(doc(db, 'users', currentFirebaseUser.uid), (adminDoc) => {
        if (adminDoc.exists()) {
           setRole(adminDoc.data()?.role || 'user');
        } else {
           setRole('user');
        }
      }, (error) => {
        console.error("Error on admin role snapshot listener:", error);
        setRole('user');
      });


      return () => {
        unsubscribeUserDoc();
        unsubscribeAdminDoc();
      };
    });

    return () => unsubscribeAuth();
  }, [impersonatedUserId]);

  const value = useMemo(() => ({
    user,
    firebaseUser,
    loading,
    role,
  }), [user, firebaseUser, loading, role]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
