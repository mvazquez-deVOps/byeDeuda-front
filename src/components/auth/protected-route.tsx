'use client';

import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: UserRole;
}) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and the role does not match, redirect.
    if (!loading && role !== requiredRole) {
      console.log(`Redirecting: user role '${role}' does not meet required role '${requiredRole}'`);
      router.push('/'); // Redirect to home page
    }
  }, [role, loading, requiredRole, router]);

  // While loading, or if the role doesn't match yet, show a loading state.
  if (loading || role !== requiredRole) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="border rounded-lg p-4 mt-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full mt-4" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    );
  }

  // If loading is complete and the role matches, render the children.
  return <>{children}</>;
}
