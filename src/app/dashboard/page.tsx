
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { DebtCard } from '@/components/dashboard/debt-card';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { db } from '@/lib/init-firebase';
import type { Debt, User } from '@/lib/types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Loader2, PlusCircle, Users, Shield, UserPlus, FileText, BarChart, Handshake, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { UserDebtTable } from '@/components/admin/user-debt-table';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

// --- Vista para el Superadministrador ---
function AdminDashboardView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de Superadministrador"
        description="Gestión global de usuarios, agentes y negociaciones."
      >
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/admin">
                    <Shield />
                    Ir al Panel Completo
                </Link>
            </Button>
            <Button asChild>
                <Link href="/admin/agents">
                    <UserPlus />
                    Crear Nuevo Agente
                </Link>
            </Button>
        </div>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados en la plataforma.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Negociaciones Activas
            </CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Tickets de negociación pendientes de asignación.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Recientes de la Plataforma</CardTitle>
          <CardDescription>Visualiza y gestiona todos los usuarios registrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserDebtTable />
        </CardContent>
      </Card>
    </div>
  );
}

// --- Componente: Guía de Metodología ---
function MethodologyGuide() {
    const steps = [
        { icon: FileText, title: "1. Registra tu Deuda", description: "Ingresa los detalles de tu deuda para que nuestra IA la analice." },
        { icon: BarChart, title: "2. Recibe tu Estrategia", description: "Obtén un plan de acción y un análisis de riesgo detallado." },
        { icon: Handshake, title: "3. Negocia con Poder", description: "Usa nuestras herramientas y conocimiento para ganar la negociación." },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tu Camino hacia la Libertad Financiera</CardTitle>
                <CardDescription>Sigue nuestra metodología probada para salir de deudas.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                        <div className="p-3 bg-primary/10 rounded-full mb-3">
                            <step.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">{step.title}</h3>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// --- Componente: Simulador de Ahorro ---
function SavingsSimulator({ user }: { user: User | null }) {
    const [debtAmount, setDebtAmount] = useState(100000);
    const [discount, setDiscount] = useState(75);

    const isPaidUser = user?.plan && user.plan !== 'Básico';
    const commissionRate = isPaidUser ? 0.20 : 0.25;

    const negotiatedAmount = debtAmount * (1 - discount / 100);
    const amountSaved = debtAmount - negotiatedAmount;
    const commission = amountSaved * commissionRate;
    const totalPayment = negotiatedAmount + commission;
    const netSaving = debtAmount - totalPayment;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Nuestro Éxito es tu Ahorro</CardTitle>
                <CardDescription>Simula tu ahorro potencial. Solo cobramos una comisión sobre el monto que te ahorramos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <Label htmlFor="debt-amount">Monto de tu Deuda</Label>
                        <Input 
                            id="debt-amount"
                            type="number"
                            placeholder="Ej. 100000"
                            value={debtAmount}
                            onChange={(e) => setDebtAmount(Number(e.target.value))}
                            className="mt-2 text-lg"
                        />
                    </div>
                    <div>
                         <Label htmlFor="discount-slider">Descuento Potencial: <span className="font-bold text-primary">{discount}%</span></Label>
                         <Slider
                            id="discount-slider"
                            min={10}
                            max={90}
                            step={5}
                            value={[discount]}
                            onValueChange={(value) => setDiscount(value[0])}
                            className="mt-4"
                        />
                    </div>
                </div>

                {debtAmount > 0 && (
                    <div className="mt-6 p-6 bg-muted rounded-lg animate-fade-in-up">
                        <h4 className="font-bold text-center text-lg text-primary mb-6">Tabla de Amortización Estimada*</h4>
                        
                        <div className="overflow-x-auto">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Deuda Original</TableCell>
                                        <TableCell className="text-right font-medium text-red-400 line-through">{formatCurrency(debtAmount)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Monto a Liquidar (con {discount}% de descuento)</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(negotiatedAmount)}</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell>Nuestra Comisión de Éxito ({commissionRate * 100}%)**</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(commission)}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-primary/10">
                                        <TableCell className="font-bold text-primary">Total que Pagarías</TableCell>
                                        <TableCell className="text-right font-bold text-primary text-xl">{formatCurrency(totalPayment)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold text-green-400">¡Tu Ahorro Neto Final!</TableCell>
                                        <TableCell className="text-right font-bold text-green-400 text-xl">{formatCurrency(netSaving)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-6 text-xs text-muted-foreground space-y-2">
                          <p>*Estimación basada en el descuento seleccionado. Los resultados reales pueden variar según la institución, tiempo de mora, y otros factores de negociación.</p>
                          <p>**Nuestra comisión estándar es del 25% sobre el monto ahorrado. {isPaidUser ? "Por ser miembro de pago, tu comisión es reducida al 20%." : "Al contratar un plan, tu comisión baja al 20%."}</p>
                        </div>

                        {!isPaidUser && (
                            <div className="bg-primary/10 border border-primary/20 text-primary-foreground p-4 rounded-lg text-center mt-6">
                                <h5 className="font-bold flex items-center justify-center gap-2"><Sparkles className="text-amber-400"/> ¡Obtén una Comisión Reducida!</h5>
                                <p className="text-sm text-primary/90 mt-2">
                                   Al contratar cualquiera de nuestros planes, tu comisión de éxito baja permanentemente al 20%. El pago de tu suscripción se abona a la comisión final.
                                </p>
                                 <Button asChild className="mt-4">
                                    <Link href="/dashboard/subscription">
                                        Ver Planes y Contratar
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


// --- Vista para el Usuario Estándar ---
function UserDashboardView() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      if (!user) setLoading(false);
      return;
    }

    setLoading(true);
    const debtsCollectionRef = collection(db, 'users', user.uid, 'debts');
    const q = query(debtsCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userDebts: Debt[] = [];
      querySnapshot.forEach((doc) => {
        userDebts.push({ id: doc.id, ...doc.data() } as Debt);
      });
      setDebts(userDebts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching debts: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getFirstName = (name?: string) => {
    if (!name) return "Usuario";
    return name.split(' ')[0];
  }

  return (
    <>
      <PageHeader
        title={`¡Bienvenido, ${getFirstName(user?.name)}!`}
        description="Aquí tienes un resumen de tu situación financiera."
      >
        <Button asChild>
          <Link href="/dashboard/add-debt">
            <PlusCircle />
            Registrar Nueva Deuda
          </Link>
        </Button>
      </PageHeader>
      
      <div className="space-y-8">
        <MethodologyGuide />
        <SavingsSimulator user={user} />

        <div>
            <h2 className="text-2xl font-headline font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary"/>
                Tus Deudas Registradas
            </h2>
             {loading ? (
                <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : debts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {debts.map(debt => (
                    <DebtCard key={debt.id} debt={debt} />
                ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold text-primary">No Tienes Deudas Registradas</h3>
                <p className="text-muted-foreground mt-2">Comienza registrando tu primera deuda para obtener un análisis.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/add-debt">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar mi Primera Deuda
                    </Link>
                    </Button>
                </div>
            )}
        </div>
      </div>
    </>
  );
}

// --- Componente Principal del Dashboard que enruta por rol ---
export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Renderiza la vista según el rol del usuario
  switch (role) {
    case 'superadmin':
      return <AdminDashboardView />;
    case 'user':
    case 'agent':
    default:
      return <UserDashboardView />;
  }
}
