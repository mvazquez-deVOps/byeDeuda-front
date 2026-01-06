
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Bot, BrainCircuit, CheckCircle, Copy, FileWarning, Lightbulb, Loader2, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateTacticalDefense } from '@/app/actions';
import type { TacticalDefenseOutput } from '@/ai/flows/schemas/negotiation-dojo-schemas';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

function DojoResult({ result }: { result: TacticalDefenseOutput }) {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado al portapapeles",
      description: "Tu respuesta blindada está lista para ser pegada.",
    });
  };

  const lieDetectorConfig = {
    true: { icon: FileWarning, color: "text-destructive", title: "Práctica Ilegal" },
    false: { icon: Lightbulb, color: "text-yellow-400", title: "Táctica de Presión" },
  }

  return (
    <div className="space-y-8 mt-8 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center font-headline">Análisis y Plan de Contraataque</h2>
      
      {/* TARJETA 1: IRREGULARIDADES */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive"><AlertTriangle />Detector de Irregularidades</CardTitle>
          <CardDescription>Estas son las tácticas de presión y posibles ilegalidades que la IA detectó en la comunicación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.lieDetector.length > 0 ? result.lieDetector.map((lie, index) => {
            const config = lieDetectorConfig[lie.isIllegal.toString() as 'true' | 'false'];
            return (
              <div key={index} className="p-4 rounded-lg bg-background/50 border flex items-start gap-4">
                <config.icon className={cn("h-6 w-6 flex-shrink-0 mt-1", config.color)} />
                <div>
                  <h4 className="font-semibold">El cobrador dijo: <span className="italic">"{lie.threat}"</span></h4>
                  <p className={cn("font-bold text-lg", config.color)}>{config.title}</p>
                  <p className="text-muted-foreground">{lie.rebuttal}</p>
                </div>
              </div>
            )
          }) : (
             <Alert className="border-green-500/30 bg-green-500/5 text-green-400">
                <CheckCircle className="h-4 w-4 !text-green-400" />
                <AlertTitle>Comunicación Limpia</AlertTitle>
                <AlertDescription>La IA no detectó amenazas o prácticas ilegales evidentes en esta comunicación.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* TARJETA 2: RESPUESTA BLINDADA */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-primary"><ShieldCheck />Tu Respuesta Blindada</CardTitle>
          <CardDescription>Copia y pega este texto exacto en el chat o correo del cobrador. No agregues ni quites nada.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap font-mono text-sm relative">
            <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => copyToClipboard(result.shieldedResponse)}>
              <Copy className="w-4 h-4" />
            </Button>
            {result.shieldedResponse}
          </div>
        </CardContent>
      </Card>
      
      {/* TARJETA 3: ESCENARIO FUTURO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><BrainCircuit />Análisis del Escenario Futuro</CardTitle>
          <CardDescription>Esta es la predicción de la IA sobre cómo reaccionará el cobrador y cuál es tu probabilidad de éxito.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Probabilidad de Éxito de la Respuesta</h4>
                    <span className="font-bold text-lg text-green-400">{result.futureScenario.successProbability}%</span>
                </div>
                <Progress value={result.futureScenario.successProbability} className="h-3 [&>div]:bg-green-400" />
            </div>
            <div>
                 <h4 className="font-semibold">Respuesta Esperada del Cobrador:</h4>
                 <Alert variant="default" className="mt-2">
                    <Bot className="h-4 w-4" />
                    <AlertTitle>Predicción de IA</AlertTitle>
                    <AlertDescription>{result.futureScenario.likelyResponse}</AlertDescription>
                 </Alert>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function TacticalDojoPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [evidenceText, setEvidenceText] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<string | null>(null);
    const [creditorType, setCreditorType] = useState<'bank' | 'store' | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TacticalDefenseOutput | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit for images
                toast({ variant: "destructive", title: "Archivo demasiado grande", description: "La imagen no puede superar los 4MB." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setEvidenceFile(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error de autenticación." });
            return;
        }
        if (!evidenceText && !evidenceFile) {
            toast({ variant: "destructive", title: "Falta evidencia", description: "Pega el texto o sube una imagen de la conversación." });
            return;
        }
        if (!creditorType) {
            toast({ variant: "destructive", title: "Falta contexto", description: "Selecciona si el acreedor es un banco o una tienda." });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const analysisResult = await generateTacticalDefense({
                evidenceText: evidenceText || undefined,
                evidenceImage: evidenceFile || undefined,
                creditorType: creditorType,
                userPlan: user.plan || 'Básico',
            });
            setResult(analysisResult);
        } catch (error: any) {
            console.error("Error generating tactical defense:", error);
            toast({ variant: "destructive", title: "Error en el Análisis", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageHeader 
                title="Dojo de Defensa Táctica" 
                description="Sube la evidencia. Recibe tu contraataque." 
            />

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Analiza una Conversación Real</CardTitle>
                    <CardDescription>Sube una captura de pantalla de WhatsApp, una foto de una carta o pega el texto que te enviaron para que la IA lo analice y te dé una respuesta blindada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="font-medium">Pega el texto aquí (si lo tienes)</label>
                        <Textarea 
                            placeholder="Ej: 'Señor Pérez, le informamos que si no liquida su adeudo de $5,000 hoy, procederemos con...'"
                            value={evidenceText}
                            onChange={(e) => setEvidenceText(e.target.value)}
                            rows={4}
                        />
                    </div>
                    
                    <div className="relative flex items-center justify-center">
                        <div className="flex-grow border-t"></div>
                        <span className="flex-shrink mx-4 text-muted-foreground">O</span>
                        <div className="flex-grow border-t"></div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium">Sube una imagen (captura de pantalla o foto)</label>
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                            {evidenceFile ? (
                                <img src={evidenceFile} alt="Vista previa" className="h-full w-full object-contain rounded-md p-2" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, etc. (Máx 4MB)</p>
                                </div>
                            )}
                        </label>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>

                     <div className="space-y-2">
                        <label className="font-medium">¿Qué tipo de empresa te está cobrando?</label>
                        <Select onValueChange={(value: 'bank' | 'store') => setCreditorType(value)} value={creditorType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el contexto para la IA..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank">Banco, SOFOM o Entidad Financiera</SelectItem>
                                <SelectItem value="store">Tienda Departamental o App de Préstamos</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Esto ayuda a la IA a identificar al regulador correcto (CONDUSEF o PROFECO).</p>
                    </div>

                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                        {isLoading ? 'Analizando Evidencia...' : 'Generar Defensa Táctica'}
                    </Button>
                    {user?.plan === 'Básico' && (
                        <Alert variant="default" className="text-center border-amber-500/30 bg-amber-500/5">
                            <AlertDescription className="text-amber-400">
                                <span className="font-bold">Eres plan Básico:</span> Recibirás un script de defensa personal. Para obtener el script de representación legal, <a href="/dashboard/subscription" className="underline font-bold">mejora a VIP</a>.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardFooter>
            </Card>

            {isLoading && (
                 <div className="text-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">La IA está analizando tu caso y preparando tu defensa...</p>
                </div>
            )}

            {result && <DojoResult result={result} />}
        </>
    );
}
