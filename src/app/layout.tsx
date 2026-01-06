
import type { Metadata } from 'next';
import '@/app/globals.css';
import { Bai_Jamjuree, Ubuntu } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { cookies } from 'next/headers';
import ImpersonationBanner from '@/components/admin/impersonation-banner';
import SalesBot from '@/components/landing/SalesBot';

const baiJamjuree = Bai_Jamjuree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-headline',
});

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Bye Deuda IA',
  description: 'Tu asistente personal de IA para la gestión de deudas.',
};

// Agrega 'async' aquí al principio
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Espera a que carguen las cookies
  const cookieStore = await cookies();

  // 2. Usa 'cookieStore' en lugar de llamar a cookies() directamente
  const impersonatedUserId = cookieStore.get('impersonate-user-id')?.value;
  const impersonatedUserName = cookieStore.get('impersonate-user-name')?.value;
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          baiJamjuree.variable,
          ubuntu.variable
        )}
      >
        <AuthProvider impersonatedUserId={impersonatedUserId}>
          {children}
          <Toaster />
          {impersonatedUserId && <ImpersonationBanner userName={impersonatedUserName} />}
          <SalesBot />
        </AuthProvider>
      </body>
    </html>
  );
}
