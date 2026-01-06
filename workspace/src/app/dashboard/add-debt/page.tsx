
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
import { Bot, ChevronLeft, Landmark } from "lucide-react";
import Link from 'next/link';
import { useAuth } from "@/components/auth/auth-provider";
import { createDebt } from "@/lib/debt";
import { analyzeDebt } from "@/app/actions";
import type { FinancialProfile } from "@/lib/types";

const formSchema = z.object({
  creditorName: z.string().min(2, "El nombre del acreedor es requerido."),
  debtAmount: z.coerce.number().positive("El monto debe ser un número positivo."),
  daysOverdue: z.coerce.number().int().min(0, "Los días de atraso no pueden ser negativos."),
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
        title: "Analizando tu deuda...",
        description: "Nuestra IA está creando tu diagnóstico de riesgo. Esto puede tardar un momento.",
      });

      // 1. Generate the basic debt analysis using AI
      const analysisResult = await analyzeDebt(
        {
            creditorName: values.creditorName,
            debtAmount: values.debtAmount,
            daysOverdue: values.daysOverdue,
        }
      );

      // 2. Create the debt document in Firestore, including the basic analysis
      const newDebtId = await createDebt({
        userId: user.uid,
        creditorName: values.creditorName,
        amount: values.debtAmount,
        daysOverdue: values.daysOverdue,
        analysis: analysisResult,
      });

      toast({
        title: "¡Deuda Registrada y Analizada!",
        description: "Hemos guardado tu nueva deuda con su diagnóstico de riesgo.",
      });

      // 3. Redirect to the new debt's detail page
      router.push(`/dashboard/debt/${newDebtId}`);

    } catch (error: any) {
        console.error("Error creating debt or generating analysis:", error);
        toast({
            variant: "destructive",
            title: "Error al Procesar la Deuda",
            description: error.message || "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        });
    }
  }

  return (
    <>
      <PageHeader title="Registrar Deuda y Obtener Diagnóstico" description="Completa los campos para recibir un análisis de riesgo básico por parte de nuestra IA.">
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
                    <CardDescription>Información sobre la deuda que quieres analizar.</CardDescription>
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

            <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                    <Bot className="mr-2 h-5 w-5" />
                    {form.formState.isSubmitting ? "Analizando Deuda..." : "Obtener Diagnóstico y Registrar"}
                </Button>
            </div>
        </form>
      </Form>
    </>
  );
}
