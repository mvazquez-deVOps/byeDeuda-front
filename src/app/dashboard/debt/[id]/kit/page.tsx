'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, Info, Loader2, Bot, FileText, Download, ShieldAlert, BookOpen, Scale, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import type { Debt } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/init-firebase';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';

function KitDocument({ debt, ref }: { debt: Debt, ref: React.Ref<HTMLDivElement> }) {
  const kit = debt.negotiationKit;
  if (!kit) return null;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  return (
    <div ref={ref} className="p-8 bg-white text-black font-serif print-only">
      <h1 className="text-3xl font-bold border-b-2 pb-2 mb-6">Kit de Autogestión y Defensa: {debt.creditorName}</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
        <div><strong>Deudor:</strong> {useAuth().user?.name}</div>
        <div><strong>Acreedor:</strong> {debt.creditorName}</div>
        <div><strong>Monto Original:</strong> {formatCurrency(debt.amount)}</div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Scale /> Regulador y Violaciones</h2>
        <p><strong>Regulador Identificado:</strong> <Badge variant="secondary">{kit.identifiedRegulator}</Badge></p>
        {kit.detectedViolations.length > 0 ? (
          <div>
            <p className="mt-2"><strong>Posibles Violaciones a la Ley de Cobranza:</strong></p>
            <ul className="list-disc list-inside mt-1 text-red-700 font-semibold">
              {kit.detectedViolations.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-green-700">No se detectaron violaciones claras en la evidencia proporcionada.</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen /> Estrategia de Negociación Personalizada</h2>
        <div className="space-y-4">
          {kit.customStrategy.map(step => (
            <div key={step.step} className="border-l-4 border-blue-600 pl-4 py-2 bg-gray-50">
              <h3 className="font-bold text-blue-800">Paso {step.step}: {step.title}</h3>
              <p className="mt-1">{step.action}</p>
            </div>
          ))}
        </div>
      </div>

      {kit.complaintDraft && (
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><FileText /> Borrador de Queja para {kit.identifiedRegulator}</h2>
          <div className="border p-4 bg-gray-50 whitespace-pre-wrap text-sm leading-relaxed">
            {kit.complaintDraft}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DefenseKitPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [debt, setDebt] = useState<Debt | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || !id) return;

    const debtDocRef = doc(db, 'users', user.uid, 'debts', id as string);

    const unsubscribe = onSnapshot(debtDocRef, (doc) => {
      if (doc.exists()) {
        const debtData = { id: doc.id, ...doc.data() } as Debt;
        setDebt(debtData);
      } else {
        console.log("No such document for kit!");
        setDebt(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching debt kit:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, id]);

  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!debt) {
    return (
        <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                No se pudieron encontrar los detalles de esta deuda.
                 <Button variant="link" onClick={() => router.push('/dashboard')}>Volver al Dashboard</Button>
            </AlertDescription>
        </Alert>
    );
  }

  if (!debt.negotiationKit) {
     return (
        <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>Kit de Defensa No Generado</AlertTitle>
            <AlertDescription>
                Esta deuda aún no tiene un kit de defensa generado. Ve al formulario de registro para crearlo.
                <Button variant="link" onClick={() => router.push('/dashboard/add-debt')}>Registrar Deuda</Button>
            </AlertDescription>
        </Alert>
     )
  }

  return (
    <>
      <div className="no-print">
        <PageHeader title={`Kit de Defensa: ${debt.creditorName}`} description="Tu estrategia y documentos personalizados, generados por IA.">
           <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                  <Link href="/dashboard">
                      <ChevronLeft />
                      Volver al Dashboard
                  </Link>
              </Button>
              <Button onClick={handlePrint}>
                  <Download className="mr-2" />
                  Descargar Kit (PDF)
              </Button>
           </div>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="text-primary"/> Dictamen de la IA</CardTitle>
            <CardDescription>
              Basado en la evidencia que proporcionaste, nuestro sistema ha generado la siguiente estrategia y documentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-6">
                  
                   {/* STRATEGY */}
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2"><BookOpen /> Estrategia de Negociación</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          {debt.negotiationKit.customStrategy.map((step) => (
                             <div key={step.step} className="flex items-start gap-4">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{step.step}</div>
                                  <div>
                                      <h4 className="font-semibold">{step.title}</h4>
                                      <p className="text-muted-foreground">{step.action}</p>
                                  </div>
                             </div>
                          ))}
                      </CardContent>
                  </Card>

                  {/* VIOLATIONS & COMPLAINT */}
                  {debt.negotiationKit.detectedViolations.length > 0 && debt.negotiationKit.complaintDraft && (
                      <Card className="border-destructive/50 bg-destructive/10">
                          <CardHeader>
                              <CardTitle className="text-xl text-destructive flex items-center gap-2"><ShieldAlert /> Violaciones Detectadas y Queja</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                               <div>
                                  <h4 className="font-semibold">Posibles Violaciones a la Ley:</h4>
                                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                      {debt.negotiationKit.detectedViolations.map((v, i) => <li key={i}>{v}</li>)}
                                  </ul>
                               </div>
                               <div>
                                  <h4 className="font-semibold">Borrador de Queja para {debt.negotiationKit.identifiedRegulator}:</h4>
                                  <Alert className="mt-2 bg-background/50 whitespace-pre-wrap">
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertTitle>Copia y pega este texto en el portal de {debt.negotiationKit.identifiedRegulator}</AlertTitle>
                                      <AlertDescription>{debt.negotiationKit.complaintDraft}</AlertDescription>
                                  </Alert>
                               </div>
                          </CardContent>
                      </Card>
                  )}

              </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Component to be printed */}
      <KitDocument debt={debt} ref={printRef} />
    </>
  );
}
