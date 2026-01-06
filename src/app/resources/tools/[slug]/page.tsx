
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { PremiumBlur } from '@/components/community/premium-blur';
import Logo from '@/components/shared/logo';
import type { EducationalResource } from '@/lib/types';
import { educationalResources as allPublicResources } from '@/lib/educational-resources'; // <--- CAMBIO CLAVE
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { CalculatorEngine } from '@/components/tools/CalculatorEngine';

function ConversionSidebar() {
    return (
        <aside className="lg:col-span-3 sticky top-24">
            <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">Toma el Control de tus Finanzas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Nuestras herramientas y asesoría están diseñadas para darte la ventaja que necesitas.</p>
                    <Button asChild className="w-full">
                        <Link href="/register?from=sidebar-cta">
                            <Shield className="mr-2" /> Activar Escudo Legal
                        </Link>
                    </Button>
                     <Button asChild variant="outline" className="w-full">
                        <Link href="/register?from=sidebar-cta&plan=vip">
                            <User className="mr-2" /> Hablar con un Asesor
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </aside>
    )
}

export default function ToolPage() {
  const params = useParams();
  const { user } = useAuth();
  const [resource, setResource] = useState<EducationalResource | null>(null);
  const [loading, setLoading] = useState(true);
  
  const slug = params.slug as string;

  const isUserPremium = user?.plan !== 'Básico';
  
  useEffect(() => {
    if (slug) {
        // Directamente usamos los recursos importados
        const res = allPublicResources.find(r => r.slug === slug && r.status === 'published' && r.type === 'tool');
        if (res) {
            setResource(res);
        } else {
            notFound();
        }
        setLoading(false);
    }
  }, [slug]);
  
  const isContentPremium = resource?.isPremium ?? false;
  const isLocked = isContentPremium && !isUserPremium;

  if (loading) {
    return <div className="bg-[#0a0a0a] min-h-screen"></div>;
  }

  if (!resource) {
    notFound();
  }

  return (
    <div className="bg-[#0a0a0a] text-gray-200 min-h-screen">
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Logo className="invert brightness-0" />
          <Button asChild variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
            <Link href="/resources">
              <ArrowLeft className="mr-2" />
              Volver a Recursos
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white leading-tight tracking-tighter mb-4">
                {resource.title}
            </h1>
            <p className="text-lg text-muted-foreground">{resource.description}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-9">
                 <PremiumBlur isLocked={isLocked}>
                    <CalculatorEngine slug={resource.slug} />
                </PremiumBlur>
            </div>
           <ConversionSidebar />
        </div>
      </main>
    </div>
  );
}
