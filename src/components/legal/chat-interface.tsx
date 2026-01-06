
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/auth-provider';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Send, Bot, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { legalAssistantChat } from '@/app/actions';

function LockedChat() {
    return (
        <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background z-10 rounded-lg"></div>
            <div className="blur-sm">
                <div className="space-y-6">
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                        <div className="max-w-md rounded-lg p-3 text-sm bg-muted"><p>¡Hola! Soy tu Asistente Legal IA...</p></div>
                    </div>
                     <div className="flex items-start gap-3 justify-end">
                        <div className="max-w-md rounded-lg p-3 text-sm bg-primary text-primary-foreground"><p>Tengo una pregunta sobre el estatuto de limitaciones...</p></div>
                        <Avatar className="w-8 h-8"><AvatarFallback>U</AvatarFallback></Avatar>
                    </div>
                </div>
            </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center">
                <Lock className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold font-headline mb-2">Chat Ilimitado con la IA</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                   Haz preguntas ilimitadas sobre tus derechos, leyes locales y estrategias de negociación.
                </p>
                <Button asChild>
                    <Link href="/dashboard/subscription">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Obtener Acceso Instantáneo
                    </Link>
                </Button>
            </div>
        </div>
    )
}


export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: "¡Hola! Soy tu Asistente Legal IA. ¿Cómo puedo ayudarte hoy con tus preguntas sobre deudas? Por favor, recuerda que soy una IA y no un abogado humano.",
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const hasPaidPlan = user?.plan && user.plan !== 'Básico';

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !hasPaidPlan) return;

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
      // Call the Server Action
      const resultText = await legalAssistantChat(currentInput);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: resultText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error al llamar al flujo de IA:", error);
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
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);


  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback><Bot /></AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">Asistente Legal IA</h2>
            <p className="text-sm text-muted-foreground">Potenciado por Gemini y Leyes Locales</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {hasPaidPlan ? (
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
                {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                    'flex items-start gap-3',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                >
                    {message.sender === 'ai' && (
                    <Avatar className="w-8 h-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    )}
                    <div
                    className={cn(
                        'max-w-md rounded-lg p-3 text-sm',
                        message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                    >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.sender === 'user' && user && (
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    )}
                </div>
                ))}
                {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 w-40">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                        </div>
                    </div>
                </div>
                )}
            </div>
            </ScrollArea>
        ) : (
            <LockedChat />
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="flex w-full items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasPaidPlan ? "Pregunta sobre cobro de deudas, estatutos, etc." : "Actualiza tu plan para chatear con la IA"}
            className="min-h-0 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || !hasPaidPlan}
          />
          <Button type="button" size="icon" disabled={isLoading || !input.trim() || !hasPaidPlan} onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
