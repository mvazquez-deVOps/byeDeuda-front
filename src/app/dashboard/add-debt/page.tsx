
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Bot, ChevronLeft, Landmark, DollarSign } from "lucide-react";
import Link from 'next/link';
import { useAuth } from "@/components/auth/auth-provider";
import { createDebt } from "@/lib/debt";
import type { FinancialProfile, LegacyDebtAnalysis } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  creditorName: z.string().min(2, "El nombre del acreedor es requerido."),
  debtAmount: z.coerce.number().positive("El monto debe ser un número positivo."),
  daysOverdue: z.coerce.number().int().min(0, "Los días de atraso no pueden ser negativos."),
  financialProfile: z.object({
    monthlyIncome: z.coerce.number().min(0, "El ingreso no puede ser negativo."),
    livingExpenses: z.coerce.number().min(0, "Los gastos no pueden ser negativos."),
    assetsRisk: z.enum(['high', 'medium', 'none']),
    immediateCapital: z.coerce.number().min(0, "El capital no puede ser negativo."),
    strategyIntent: z.enum(['stall', 'pay_now', 'monthly_payments']),
  })
});


export default function AddDebtPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creditorName: "",
      debtAmount: 0,
      daysOverdue: 0,
      financialProfile: {
        monthlyIncome: 0,
        livingExpenses: 0,
        assetsRisk: 'none',
        immediateCapital: 0,
        strategyIntent: 'stall',
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "Debes iniciar sesión para registrar una deuda.",
        });
        return;
    }

    try {
      toast({
        title: "Registrando tu deuda...",
        description: "Estamos guardando la información de tu deuda. Esto puede tardar un momento.",
      });

      // MOCK ANALYSIS - Create a fake analysis object to pass to the createDebt function
      const analysisResult: LegacyDebtAnalysis = {
        riskAssessment: {
          riskLevel: 'medium',
          riskScore: 50,
          explanation: 'Análisis simulado: El riesgo se establece como medio por defecto al desactivar la IA.',
        },
        negotiationStrategy: {
          step1: 'Paso 1 (simulado): Contactar al acreedor por un canal oficial.',
          step2: 'Paso 2 (simulado): Solicitar un estado de cuenta detallado.',
          step3: 'Paso 3 (simulado): No realizar pagos hasta tener un acuerdo por escrito.',
        },
      };

      // Create the debt document in Firestore, including the MOCKED analysis
      const newDebtId = await createDebt({
        userId: user.uid,
        creditorName: values.creditorName,
        amount: values.debtAmount,
        daysOverdue: values.daysOverdue,
        analysis: analysisResult,
      });
      
      // Here you would typically update the user's financial profile as well.
      // For now, we're just logging it to the console.
      console.log("Financial Profile Submitted:", values.financialProfile);

      toast({
        title: "¡Deuda Registrada!",
        description: "Hemos guardado tu nueva deuda. El análisis de IA está desactivado temporalmente.",
      });

      // Redirect to the new debt's detail page
      router.push(`/dashboard/debt/${newDebtId}`);

    } catch (error: any) {
        console.error("Error creating debt:", error);
        toast({
            variant: "destructive",
            title: "Error al Registrar la Deuda",
            description: error.message || "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        });
    }
  }

  return (
    <>
      <PageHeader title="Registrar Nueva Deuda" description="Completa los campos para añadir una nueva deuda a tu dashboard.">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ChevronLeft />
            Volver al Dashboard
          </Link>
        </Button>
      </PageHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Landmark/> Detalles de la Deuda</CardTitle>
                    <CardDescription>Información sobre la deuda que quieres registrar.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="creditorName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Acreedor</FormLabel>
                            <FormControl>
                            <Input placeholder="Ej. Banco Regional, Sertec" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="debtAmount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto Adeudado ($)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="5200" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="daysOverdue"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Días de Atraso</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="120" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign/> Perfil Financiero</CardTitle>
                    <CardDescription>Esta información ayuda a la IA a entender tu contexto y crear una mejor estrategia.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="financialProfile.monthlyIncome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ingreso Mensual Neto</FormLabel>
                                    <FormControl><Input type="number" placeholder="15000" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="financialProfile.livingExpenses"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gastos Fijos Mensuales</FormLabel>
                                    <FormControl><Input type="number" placeholder="10000" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="financialProfile.assetsRisk"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Tienes bienes a tu nombre (casa, auto)?</FormLabel>
                                <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center gap-6 pt-2"
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="high" /></FormControl>
                                        <FormLabel className="font-normal">Sí</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="none" /></FormControl>
                                        <FormLabel className="font-normal">No</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="financialProfile.immediateCapital"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Capital para Negociar Hoy</FormLabel>
                                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                     <FormDescription>¿Cuánto tienes ahorrado para liquidar?</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="financialProfile.strategyIntent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tu Intención Principal</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecciona una estrategia..." /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pay_now">Liquidar ya (con Quita)</SelectItem>
                                            <SelectItem value="monthly_payments">Pagar en mensualidades (Reestructura)</SelectItem>
                                            <SelectItem value="stall">Ganar tiempo / Detener acoso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                    {form.formState.isSubmitting ? "Registrando..." : "Registrar Deuda"}
                </Button>
            </div>
        </form>
      </Form>
    </>
  );
}
