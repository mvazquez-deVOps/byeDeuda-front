
'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskIndicator } from '@/components/dashboard/risk-indicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, Info, Loader2, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Debt } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/init-firebase';
import { useAuth } from '@/components/auth/auth-provider';
import { NegotiationTimeline } from '@/components/dashboard/negotiation-timeline';


export default function DebtDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();

  const [debt, setDebt] = useState<Debt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const debtDocRef = doc(db, 'users', user.uid, 'debts', id as string);

    const unsubscribe = onSnapshot(debtDocRef, (doc) => {
      if (doc.exists()) {
        const debtData = { id: doc.id, ...doc.data() } as Debt;
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const ANNUAL_INTEREST_RATE = 0.45; // Simulated 45% annual interest
        const dailyRate = ANNUAL_INTEREST_RATE / 365;

        // Calculate days passed since debt was created
        const daysSinceCreation = debtData.createdAt ? Math.floor((new Date().getTime() - debtData.createdAt.toDate().getTime()) / ONE_DAY_MS) : 0;
        debtData.currentDaysOverdue = debtData.daysOverdue + daysSinceCreation;

        // Calculate simulated interest
        const interestGenerated = debtData.amount * dailyRate * daysSinceCreation;
        debtData.estimatedInterest = interestGenerated;

        // Calculate current total amount
        debtData.currentAmount = debtData.amount + interestGenerated;

        setDebt(debtData);
      } else {
        console.log("No such document!");
        setDebt(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching debt details:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, id]);

  if (loading) {
    return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!debt) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">Deuda no encontrada</h2>
            <p className="text-muted-foreground mt-2">No se pudieron encontrar los detalles de esta deuda.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
        </div>
    );
  }
  
  const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    overdue: "destructive",
    in_negotiation: "default",
    resolved: "secondary",
    pending_analysis: "outline"
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <>
      <PageHeader title={debt.creditorName} description={`Detalles de tu deuda de ${formatCurrency(debt.amount)}.`}>
        <Button variant="outline" asChild>
            <Link href="/dashboard">
                <ChevronLeft />
                Volver al Dashboard
            </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           {debt.negotiationStatus ? (
             <Card>
                <CardHeader>
                    <CardTitle>Rastreador de Negociación</CardTitle>
                    <CardDescription>Sigue el progreso de nuestra gestión en tiempo real.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NegotiationTimeline 
                        currentStage={debt.negotiationStatus}
                        progress={debt.negotiationProgress}
                    />
                </CardContent>
            </Card>
           ) : debt.analysis ? (
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Negociación no iniciada</AlertTitle>
                <AlertDescription>
                    Esta deuda ha sido analizada, pero el proceso de negociación activo aún no ha comenzado.
                </AlertDescription>
            </Alert>
           ) : (
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Análisis Pendiente</AlertTitle>
                <AlertDescription>
                    Esta deuda aún no ha sido analizada por nuestra IA. Puedes iniciar un análisis desde el panel de control.
                </AlertDescription>
            </Alert>
           )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Deuda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto Original</span>
                <span className="font-bold">{formatCurrency(debt.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días de Atraso (Registro)</span>
                <span className="font-bold">{debt.daysOverdue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estatus</span>
                <Badge variant={statusVariantMap[debt.status] || 'default'} className="capitalize">
                  {debt.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
           <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp/>Proyección de Deuda</CardTitle>
                    <CardDescription>Estimación del crecimiento de la deuda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Días de Atraso Actuales</span>
                        <span className="font-bold text-amber-400">{debt.currentDaysOverdue}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Intereses Simulados</span>
                        <span className="font-bold text-red-400">+{formatCurrency(debt.estimatedInterest || 0)}</span>
                    </div>
                    <Separator/>
                     <div className="flex justify-between font-bold text-lg">
                        <span className="text-foreground">Monto Total Proyectado</span>
                        <span className="text-red-400">{formatCurrency(debt.currentAmount || debt.amount)}</span>
                    </div>
                </CardContent>
            </Card>

           {debt.analysis && (
            <Card>
                <CardHeader>
                    <CardTitle>Evaluación de Riesgo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Nivel de Riesgo</span>
                        <RiskIndicator riskLevel={debt.analysis.riskAssessment.riskLevel} />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Puntaje de Riesgo</span>
                        <span className="font-bold">{debt.analysis.riskAssessment.riskScore} / 100</span>
                    </div>
                    <Separator />
                    <p className="text-sm text-muted-foreground pt-2">{debt.analysis.riskAssessment.explanation}</p>
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </>
  );
}

    