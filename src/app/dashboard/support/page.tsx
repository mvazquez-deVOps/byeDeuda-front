
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Bot, Mail, Ticket, LifeBuoy, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { supportChat } from '@/app/actions';
import { Badge } from '@/components/ui/badge';

function SupportChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: "¡Hola! Soy tu asistente de Soporte Bye Deuda. ¿En qué puedo ayudarte hoy sobre pagos, nuestro proceso o cualquier otra duda general?",
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const resultText = await supportChat(currentInput);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: resultText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error calling support AI flow:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Lo siento, he encontrado un error. Por favor, inténtalo de nuevo.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-18rem)]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback><Bot /></AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">Soporte Automático</h2>
            <p className="text-sm text-muted-foreground">Resuelve tus dudas al instante</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
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
                <div className="bg-muted rounded-lg p-3 w-40">
                  <div className="space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="flex w-full items-center gap-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta aquí..." className="min-h-0 resize-none" rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} disabled={isLoading} />
          <Button type="button" size="icon" disabled={isLoading || !input.trim()} onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
}

const recentTickets = [
    { id: '#001', subject: 'Duda sobre tiempo de pago', status: 'Resuelto', statusVariant: 'secondary' },
    { id: '#002', subject: 'Problema con la negociación', status: 'Pendiente', statusVariant: 'destructive' },
    { id: '#003', subject: 'Actualizar método de pago', status: 'En progreso', statusVariant: 'default' },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Centro de Soporte Inteligente"
        description="Resuelve tus dudas al instante con nuestra IA o contacta a nuestro equipo."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <SupportChatInterface />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ticket className="text-primary"/> Mis Tickets Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentTickets.map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <p className="text-sm text-muted-foreground">{ticket.id}</p>
                            </div>
                            <Badge variant={ticket.statusVariant as any}>{ticket.status}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
           <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck className="text-primary"/> ¿Necesitas un Humano?</CardTitle>
              <CardDescription>Si la IA no pudo resolver tu problema, nuestro equipo está aquí para ayudar.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <Button asChild className="w-full">
                    <a href="mailto:hola@byedeuda.com">
                        <Mail className="mr-2"/> Enviar Correo
                    </a>
                </Button>
                 <Button variant="outline" className="w-full">
                    <Ticket className="mr-2"/> Abrir Nuevo Ticket
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

    