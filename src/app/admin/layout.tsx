
'use client';

import { AppSidebar } from '@/components/shared/app-sidebar';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { MobileSidebar } from '@/components/shared/mobile-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (role !== 'superadmin' && role !== 'agent')) {
      router.push('/dashboard');
    }
  }, [user, loading, role, router]);

  if (loading || !user || (role !== 'superadmin' && role !== 'agent')) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
     <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">

      <aside className="flex-shrink-0 z-20 hidden md:block">
        <AppSidebar />
      </aside>
      
      <div className="md:hidden">
        <MobileSidebar />
      </div>

      <main className="flex-1 overflow-y-auto relative bg-background">
        <div className="h-full w-full p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
