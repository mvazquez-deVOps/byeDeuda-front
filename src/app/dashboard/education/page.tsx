
'use client';

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BarChart2, Banknote, Newspaper, Podcast, Lightbulb, GitFork, Puzzle, Lock, Sparkles, ShieldCheck, AlertTriangle, Footprints, Loader2, X } from "lucide-react";
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { simulateNegotiation } from '@/app/actions';
import type { NegotiationSimulatorInput, NegotiationSimulatorOutput } from '@/ai/flows/negotiation-simulator-flow';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useState } from "react";


const blogContent = [
  {
    id: 1,
    title: "El Método Bola de Nieve vs. Avalancha",
    description: "Comprende dos de las estrategias más populares para pagar deudas y decide cuál es la mejor para ti.",
    icon: BarChart2,
    image: "https://picsum.photos/seed/edu1/600/400",
    imageHint: "finance chart",
    fullContent: `
Ambas estrategias son excelentes para eliminar deudas, pero funcionan de manera diferente.

**Método Bola de Nieve:**
1.  **Ordena tus deudas** de menor a mayor saldo, sin importar la tasa de interés.
2.  **Paga el mínimo** en todas tus deudas, excepto en la más pequeña.
3.  **Destina todo el dinero extra** que puedas a la deuda más pequeña hasta que la elimines.
4.  Una vez eliminada, toma todo el dinero que pagabas a esa deuda (el mínimo más el extra) y aplícalo a la siguiente deuda más pequeña.
5.  Repite hasta que todas tus deudas estén pagadas.

*Ventaja psicológica:* Logras victorias rápidas, lo que te mantiene motivado.

**Método Avalancha:**
1.  **Ordena tus deudas** de mayor a menor tasa de interés.
2.  **Paga el mínimo** en todas tus deudas.
3.  **Destina todo el dinero extra** a la deuda con la tasa de interés más alta.
4.  Once eliminada, aplica todo ese pago a la siguiente deuda con la tasa más alta.

*Ventaja matemática:* Ahorras más dinero en intereses a largo plazo.

**¿Cuál elegir?** Si necesitas motivación y ver progreso rápido, elige la Bola de Nieve. Si eres disciplinado y quieres optimizar tus finanzas, la Avalancha es para ti.`
  },
  {
    id: 2,
    title: "Cómo Crear un Presupuesto que Funcione",
    description: "Aprende a rastrear tus ingresos y gastos para tomar el control de tu dinero de una vez por todas.",
    icon: Banknote,
    image: "https://picsum.photos/seed/edu2/600/400",
    imageHint: "budget notebook",
    fullContent: `
Un presupuesto no es una camisa de fuerza, es una herramienta de libertad. El más popular es el 50/30/20:

1.  **Calcula tus ingresos netos:** Es el dinero que recibes después de impuestos.
2.  **50% para Necesidades:** Gastos que no puedes evitar como vivienda, comida, transporte, servicios básicos.
3.  **30% para Deseos:** Salidas a comer, entretenimiento, hobbies, compras no esenciales.
4.  **20% para Ahorro y Deudas:** Este es el dinero que destinarás a tu fondo de emergencia, inversiones y, crucialmente, a pagar tus deudas (idealmente, más del pago mínimo).

Usa una app, una hoja de cálculo o una libreta para rastrear cada gasto. Revisa tu presupuesto mensualmente y ajústalo según sea necesario.`
  },
  {
    id: 3,
    title: "Entendiendo tu Reporte de Crédito",
    description: "Descubre qué información contiene tu reporte de crédito, cómo leerlo y por qué es tan importante.",
    icon: BookOpen,
    image: "https://picsum.photos/seed/edu3/600/400",
    imageHint: "reading document",
    fullContent: `
Tu reporte de crédito es tu historial financiero. Contiene:

*   **Información Personal:** Nombre, dirección, etc.
*   **Cuentas de Crédito:** Tarjetas, préstamos, hipotecas. Muestra saldos, límites, historial de pagos.
*   **Consultas (Inquiries):** Quién ha revisado tu crédito. Las "Hard inquiries" (cuando aplicas a un nuevo crédito) pueden bajar tu puntaje temporalmente.
*   **Registros Públicos:** Bancarrotas o juicios.

Tienes derecho a un reporte gratuito al año de cada buró de crédito. Revísalo en busca de errores. Disputar errores y corregirlos puede mejorar tu puntaje significativamente.`
  },
  {
    id: 4,
    title: "Tus Derechos Frente a los Cobradores",
    description: "Conoce las leyes que te protegen del acoso y las prácticas ilegales de los despachos de cobranza.",
    icon: ShieldCheck,
    image: "https://picsum.photos/seed/edu4/600/400",
    imageHint: "legal book",
    fullContent: `
La ley te protege. Los cobradores NO pueden:

*   **Llamarte antes de las 8 a.m. o después de las 9 p.m.**
*   **Amenazarte** con violencia o lenguaje obsceno.
*   **Llamarte al trabajo** si les has dicho (verbalmente o por escrito) que no puedes recibir llamadas ahí.
*   **Hablar de tu deuda con terceros** (familiares, amigos, compañeros de trabajo), excepto para obtener tu información de contacto.
*   **Mentir** sobre la cantidad que debes o hacerse pasar por abogados si no lo son.

Si un cobrador viola tus derechos, puedes demandarlo. Documenta todo: fecha, hora, nombre del cobrador y lo que dijo.`
  },
];

function LockedFeatureCard({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[300px] bg-muted/50 relative overflow-hidden">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
                <Lock className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold font-headline text-center mb-2">Función Premium</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-xs">
                   Actualiza tu plan para acceder a esta y otras herramientas exclusivas.
                </p>
                <Button asChild>
                    <Link href="/dashboard/subscription">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Ver Planes
                    </Link>
                </Button>
            </div>
        </Card>
    )
}

function Simulator() {
    const { toast } = useToast();
    const [scenario, setScenario] = useState<NegotiationSimulatorInput>({ debtType: '', contactedBy: '' });
    const [result, setResult] = useState<NegotiationSimulatorOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulation = async () => {
        if (!scenario.debtType || !scenario.contactedBy) {
            toast({
                variant: 'destructive',
                title: 'Información Incompleta',
                description: 'Por favor, selecciona el tipo de deuda y quién te contacta.',
            });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const simulationResult = await simulateNegotiation(scenario);
            setResult(simulationResult);
        } catch (error) {
            console.error("Error running simulation:", error);
            toast({
                variant: 'destructive',
                title: 'Error en la Simulación',
                description: 'La IA no pudo procesar tu escenario. Inténtalo de nuevo.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const urgencyConfig = {
        'Baja': { color: 'text-green-400', bgColor: 'bg-green-500/10', icon: ShieldCheck },
        'Media': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: AlertTriangle },
        'Alta': { color: 'text-red-400', bgColor: 'bg-red-500/10', icon: AlertTriangle },
    };
    
    const UrgencyIcon = result ? urgencyConfig[result.urgencyLevel].icon : null;

    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Puzzle className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Simulador de Decisiones</CardTitle>
                </div>
                <CardDescription>
                    ¿No sabes qué hacer? Elige tu escenario y nuestra IA te guiará sobre los mejores pasos a seguir, desde qué decir hasta cuándo actuar.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de Crédito</label>
                        <Select onValueChange={(value) => setScenario(s => ({...s, debtType: value}))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo de deuda" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                                <SelectItem value="Hipotecario">Hipotecario</SelectItem>
                                <SelectItem value="Automotriz">Automotriz</SelectItem>
                                <SelectItem value="Préstamo Personal">Préstamo Personal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">¿Quién te contacta?</label>
                        <Select onValueChange={(value) => setScenario(s => ({...s, contactedBy: value}))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona quién te busca" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="El banco original">El banco original</SelectItem>
                                <SelectItem value="Un despacho de cobranza">Un despacho de cobranza</SelectItem>
                                <SelectItem value="Un despacho de abogados">Un despacho de abogados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="text-center pt-4">
                    <Button size="lg" onClick={handleSimulation} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                        {isLoading ? 'Analizando Escenario...' : 'Generar Simulación'}
                    </Button>
                </div>
                
                {result && (
                    <Card className="bg-background/70 border-primary/50 mt-8 animate-fade-in-up">
                        <CardHeader>
                            <CardTitle className="text-xl font-headline text-primary">Dictamen de la IA</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             {UrgencyIcon && <div className={cn("p-4 rounded-lg flex items-center gap-4", urgencyConfig[result.urgencyLevel].bgColor)}>
                                <UrgencyIcon className={cn("h-8 w-8", urgencyConfig[result.urgencyLevel].color)} />
                                <div>
                                    <h4 className="font-semibold">Nivel de Urgencia</h4>
                                    <p className={cn("text-lg font-bold", urgencyConfig[result.urgencyLevel].color)}>{result.urgencyLevel}</p>
                                </div>
                            </div>}
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-400" />Posibles Consecuencias</h4>
                                <p className="text-muted-foreground">{result.likelyOutcome}</p>
                            </div>
                             <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2"><Footprints className="h-5 w-5 text-green-400" />Primer Paso Recomendado</h4>
                                <p className="text-foreground font-medium">{result.recommendedFirstStep}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}

export default function EducationPage() {
  const { user } = useAuth();
  const hasPaidPlan = user?.plan && user.plan !== 'Básico';

  return (
    <>
      <PageHeader
        title="Centro Educativo"
        description="Conocimiento y herramientas para potenciar tu libertad financiera."
      />
      <Tabs defaultValue="blog" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="blog"><Newspaper className="mr-2 h-4 w-4" />Blog</TabsTrigger>
          <TabsTrigger value="podcast"><Podcast className="mr-2 h-4 w-4" />Podcast</TabsTrigger>
          <TabsTrigger value="microlearning"><Lightbulb className="mr-2 h-4 w-4" />Microlearning</TabsTrigger>
          <TabsTrigger value="simulator"><GitFork className="mr-2 h-4 w-4" />Simulador</TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogContent.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <Card className="flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
                    <CardHeader>
                      <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                        <Image 
                          src={item.image}
                          alt={item.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          data-ai-hint={item.imageHint}
                        />
                      </div>
                      <CardTitle className="flex items-start gap-2 text-lg">
                        <span>{item.title}</span>
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                        <Button variant="outline" className="w-full">
                          Leer Artículo
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                  </Card>
                </DialogTrigger>
                 <DialogContent className="sm:max-w-3xl max-h-[90svh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold font-headline bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text mt-4">
                            {item.title}
                        </DialogTitle>
                        <DialogDescription>
                        {item.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative h-60 w-full my-4 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                            src={item.image}
                            alt={item.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={item.imageHint}
                        />
                    </div>
                    <div className="overflow-y-auto pr-6 -mr-6 flex-grow">
                      <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {item.fullContent}
                      </div>
                    </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="podcast">
            {hasPaidPlan ? (
                 <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[300px] bg-muted/50">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                            <Podcast className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Podcasts Próximamente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Estamos grabando conversaciones con expertos para traerte las mejores estrategias en formato de audio. ¡Vuelve pronto!</p>
                    </CardContent>
                </Card>
            ) : (
                <LockedFeatureCard 
                    title="Podcasts Exclusivos"
                    description="Accede a conversaciones con expertos sobre negociación, finanzas y mentalidad para salir de deudas."
                    icon={Podcast}
                />
            )}
        </TabsContent>
        
        <TabsContent value="microlearning">
             {hasPaidPlan ? (
                 <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[300px] bg-muted/50">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                            <Lightbulb className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Microlearning en Construcción</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Cápsulas de video y lecciones interactivas de 5 minutos para aprender sobre finanzas de forma rápida y efectiva.</p>
                    </CardContent>
                </Card>
            ) : (
                <LockedFeatureCard 
                    title="Cursos Interactivos"
                    description="Aprende a tu ritmo con lecciones de 5 minutos, videos y quizzes para dominar tus finanzas."
                    icon={Lightbulb}
                />
            )}
        </TabsContent>

        <TabsContent value="simulator">
            {hasPaidPlan ? (
                <Simulator />
            ) : (
                <LockedFeatureCard 
                    title="Simulador de Decisiones"
                    description="Practica escenarios de negociación con una IA para saber exactamente qué decir y qué hacer en cada situación."
                    icon={GitFork}
                />
            )}
        </TabsContent>
      </Tabs>
    </>
  );
}
