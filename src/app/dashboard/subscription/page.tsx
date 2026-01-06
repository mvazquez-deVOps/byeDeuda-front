"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PLANS } from '@/lib/plans';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubscribe = useCallback(async (planName: string) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "Debes iniciar sesión para suscribirte a un plan.",
        });
        router.push('/login');
        return;
    }
    
    const plan = Object.values(PLANS).find(p => p.name === planName);
    if (!plan) {
        toast({ variant: "destructive", title: "Plan no válido" });
        return;
    }

    setLoadingPlanId(plan.priceId);

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planName: plan.name }),
        });

        const { url, error } = await response.json();

        if (!response.ok) {
            throw new Error(error || 'Error al crear la sesión de pago.');
        }
        
        if (url) {
            window.location.href = url;
        } else {
            throw new Error("No se recibió la URL de pago.");
        }
    } catch (e: any) {
      console.error("Subscription page error:", e);
      toast({
            variant: "destructive",
            title: "Error al iniciar pago",
            description: e.message || "Hubo un problema al conectar con el sistema de pagos. Intenta de nuevo.",
      });
      setLoadingPlanId(null);
    }
  }, [user, router, toast]);
  
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast({
        title: "¡Suscripción Exitosa!",
        description: "Gracias por unirte. Tu plan ha sido activado.",
        variant: 'default',
        className: 'bg-green-500/10 border-green-500/20 text-green-400'
      })
    }
    if (canceled) {
       toast({
        title: "Pago Cancelado",
        description: "Tu proceso de pago fue cancelado. Puedes intentar de nuevo cuando quieras.",
      })
    }

  }, [searchParams, toast]);


  return (
    <>
      <PageHeader 
        title="Elige tu Nivel de Protección"
        description="Pagos seguros procesados por Stripe. Invierte en tu tranquilidad. Cancela en cualquier momento."
      />
       <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground mb-8">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>Transacciones Seguras con Stripe</span>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
        
        {/* Basic Plan */}
        <Card className={cn("flex flex-col h-full bg-card/50", user?.plan === PLANS.BASIC.name && "border-primary")}>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">{PLANS.BASIC.name}</CardTitle>
              <CardDescription className="min-h-[20px]">Autogestiona tus deudas con el poder de nuestra IA.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-5xl font-bold mb-6">${PLANS.BASIC.price} <span className="text-lg text-muted-foreground font-normal">/mes</span></div>
              <ul className="text-left space-y-3 mb-8 text-muted-foreground">
                {PLANS.BASIC.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubscribe(PLANS.BASIC.name)}
                disabled={loadingPlanId === PLANS.BASIC.priceId || user?.plan === PLANS.BASIC.name}
                className="w-full font-bold py-6 text-lg"
                size="lg"
              >
                {user?.plan === PLANS.BASIC.name ? "Plan Actual" : (loadingPlanId === PLANS.BASIC.priceId ? <Loader2 className="animate-spin" /> : "Seleccionar Plan")}
              </Button>
            </CardFooter>
        </Card>

        {/* VIP Plan */}
        <div className="relative h-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg blur-md opacity-50"></div>
            <Card className={cn("relative flex flex-col h-full", user?.plan === PLANS.VIP.name && "border-amber-400")}>
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg">Recomendado</Badge>
                <CardHeader>
                <CardTitle className="text-2xl font-headline">{PLANS.VIP.name}</CardTitle>
                <CardDescription className="min-h-[20px]">Delega todo a nuestros expertos. Nosotros negociamos por ti.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                <div className="text-5xl font-bold mb-6">${PLANS.VIP.price} <span className="text-lg text-muted-foreground font-normal">/mes</span></div>
                <ul className="text-left space-y-3 mb-8 text-muted-foreground">
                    {PLANS.VIP.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <Star className="text-amber-500 w-5 h-5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                    ))}
                </ul>
                </CardContent>
                <CardFooter>
                <Button 
                    onClick={() => handleSubscribe(PLANS.VIP.name)}
                    disabled={loadingPlanId === PLANS.VIP.priceId || user?.plan === PLANS.VIP.name}
                    className="w-full font-bold py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:brightness-110 transition-all"
                    size="lg"
                >
                   {user?.plan === PLANS.VIP.name ? "Plan Actual" : (loadingPlanId === PLANS.VIP.priceId ? <Loader2 className="animate-spin" /> : "Obtener Acceso VIP")}
                </Button>
                </CardFooter>
            </Card>
        </div>

      </div>
    </>
  );
}
