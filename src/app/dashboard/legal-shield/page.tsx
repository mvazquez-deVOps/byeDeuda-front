
'use client';

import { useState, useRef } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, FileText, AlertTriangle, ShieldCheck, CheckCircle, Clock, Bot } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { AnalyzeDocumentOutput, Message } from '@/lib/types';
import { analyzeDocument, legalAssistantChat } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/auth-provider';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const riskLabelConfig = {
    'Riesgo Alto': { color: 'bg-red-500', icon: AlertTriangle, badge: 'destructive' },
    'Segura para Pagar': { color: 'bg-green-500', icon: ShieldCheck, badge: 'secondary' },
    'Faltan Datos': { color: 'bg-yellow-500', icon: FileText, badge: 'default' },
} as const;

function DocumentContextChat({ documentData }: { documentData: AnalyzeDocumentOutput }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-context',
      text: "¡Análisis completo! Soy tu asistente contextual. Ahora que he 'leído' el documento, puedes hacerme preguntas específicas sobre él. Por ejemplo: '¿Qué significa la cláusula tercera?' o '¿Hasta cuándo tengo para pagar?'.",
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: `user-${Date.now()}`, text: input, sender: 'user', timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Prepend the document context to the user's question
      const contextualQuestion = `Basado en el siguiente documento, responde a mi pregunta.\n\n--- INICIO DOCUMENTO ---\n${documentData.extractedText}\n--- FIN DOCUMENTO ---\n\nPregunta: ${currentInput}`;
      
      const resultText = await legalAssistantChat(contextualQuestion);
      const aiMessage: Message = { id: `ai-${Date.now()}`, text: resultText, sender: 'ai', timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error en el chat contextual:", error);
      const errorMessage: Message = { id: `error-${Date.now()}`, text: 'Lo siento, he encontrado un error.', sender: 'ai', timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const getInitials = (name: string | undefined) => name ? name.split(' ').map(n => n[0]).join('') : 'U';

  return (
    <Card className="mt-8 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> Chat Contextual sobre el Documento</CardTitle>
        <CardDescription>Haz preguntas específicas sobre el documento que acabas de subir.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] flex flex-col">
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex items-start gap-3', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                {message.sender === 'ai' && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                <div className={cn('max-w-md rounded-lg p-3 text-sm', message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.sender === 'user' && user && <Avatar className="w-8 h-8"><AvatarFallback>{getInitials(user.name)}</AvatarFallback></Avatar>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                <div className="bg-muted rounded-lg p-3 w-40 space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center gap-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta sobre una cláusula, fecha o monto..." onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} disabled={isLoading} rows={1} className="min-h-0 resize-none" />
          <Button type="button" size="icon" disabled={isLoading || !input.trim()} onClick={handleSendMessage}><Send /></Button>
        </div>
      </CardFooter>
    </Card>
  );
}


function AnalysisResult({ result }: { result: AnalyzeDocumentOutput }) {
    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'No especificado';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };
    
    const config = riskLabelConfig[result.riskLabel];

    return (
        <Card className="mt-8 animate-fade-in-up border-primary/50">
            <CardHeader>
                <div className="flex items-center gap-4">
                     <div className={cn("p-2 rounded-full", config.color)}>
                        <config.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-headline text-primary">{result.riskLabel}</CardTitle>
                        <CardDescription>Dictamen de la IA sobre tu documento.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Tipo de Documento:</strong> {result.documentType}</p>
                    <p><strong>Acreedor:</strong> {result.creditorName}</p>
                    <p><strong>Monto a Pagar:</strong> {formatCurrency(result.extractedAmount)}</p>
                    <p><strong>¿Demanda Judicial?:</strong> <Badge variant={result.isRealThreat ? 'destructive' : 'secondary'}>{result.isRealThreat ? 'Sí' : 'No'}</Badge></p>
                </div>
                
                <div>
                    <h4 className="font-semibold">Resumen y Siguiente Paso:</h4>
                    <p className="text-muted-foreground mt-1">{result.summary}</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function LegalShieldPage() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeDocumentOutput | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAnalysisResult(null);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result as string;
                setPreview(dataUrl);
                setIsUploading(true);
                try {
                    toast({ title: "Analizando documento...", description: "La IA está examinando la imagen para validar el convenio." });
                    const result = await analyzeDocument({ documentImage: dataUrl });
                    setAnalysisResult(result);
                    toast({ title: "¡Validación Completa!", description: "La IA ha emitido su dictamen." });
                } catch (error: any) {
                    console.error("Error analyzing document:", error);
                    toast({ variant: 'destructive', title: "Error de Análisis", description: error.message });
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
             handleFileChange({ target: { files: [file] } } as any);
        }
    }

    return (
        <>
            <PageHeader 
                title="Validador de Cartas Convenio"
                description="Sube tu convenio de pago ANTES de pagar para que la IA verifique su validez."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Carga tu Documento</CardTitle>
                            <CardDescription>Sube una foto clara o el PDF de la carta convenio que te enviaron.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <input 
                                type="file"
                                id="document-upload"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                            <label 
                                htmlFor="document-upload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted",
                                    isUploading && "cursor-wait"
                                )}
                            >
                                {preview ? (
                                    <div className="relative w-full h-full">
                                        <Image src={preview} alt="Vista previa" fill style={{ objectFit: 'contain' }} className="p-2" />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                <p className="mt-4 font-semibold text-primary">Validando convenio...</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-4">
                                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                        </p>
                                        <p className="text-xs text-muted-foreground">Imagen (JPG, PNG) o PDF</p>
                                    </div>
                                )}
                            </label>

                            {analysisResult && <AnalysisResult result={analysisResult} />}

                        </CardContent>
                    </Card>

                    {analysisResult && (
                        <DocumentContextChat documentData={analysisResult} />
                    )}
                </div>

                <aside className="lg:col-span-1 space-y-4 sticky top-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Checklist de Validación</CardTitle>
                            <CardDescription>Nuestra IA busca estos puntos clave:</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Logo y nombre del acreedor</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Tu nombre completo y correcto</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Monto exacto a pagar</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Mención de "Finiquito" o "Pago Total"</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Fecha de vigencia de la oferta</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Firma del representante</li>
                            </ul>
                        </CardContent>
                     </Card>
                </aside>
            </div>
        </>
    )
}
