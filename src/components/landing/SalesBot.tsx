
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Send, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { interactWithSalesBot } from '@/app/actions';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function SalesBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: 'Hola, soy la IA de Bye Deuda. ¿Te están acosando los cobradores? Puedo explicarte cómo detenerlos.',
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: `user-${Date.now()}`, text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    startTransition(async () => {
      const response = await interactWithSalesBot(currentInput);
      const aiMessage: Message = { id: `ai-${Date.now()}`, text: response, sender: 'ai' };
      setMessages((prev) => [...prev, aiMessage]);
    });
  };

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-2xl transition-all duration-300 hover:scale-110"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <MessageSquare />}
        </Button>
      </div>

      {/* Ventana de Chat */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[700px] origin-bottom-right transition-all duration-300',
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
        )}
      >
        <div className="h-full w-full flex flex-col rounded-2xl bg-card border shadow-2xl">
          <header className="p-4 border-b flex items-center gap-3 bg-muted/50 rounded-t-2xl">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm opacity-75"></div>
                <div className="relative p-2 bg-card rounded-full">
                    <Bot className="w-6 h-6 text-primary" />
                </div>
            </div>
            <div>
                <h3 className="font-bold font-headline text-lg text-primary">Asistente de Ventas IA</h3>
                <p className="text-xs text-muted-foreground">Resuelve tus dudas al instante</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex items-start gap-2', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                {message.sender === 'ai' && <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-1" />}
                <div className={cn('max-w-[85%] rounded-2xl p-3 text-sm', message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none')}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isPending && (
                <div className="flex items-start gap-2 justify-start">
                    <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div className="bg-muted rounded-2xl p-3 rounded-bl-none">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t p-4 space-y-3">
             <Button asChild className="w-full">
                <Link href="/register">
                    <Sparkles className="mr-2" /> Comenzar Ahora
                </Link>
             </Button>
             <div className="flex items-center gap-2">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu duda..."
                    className="min-h-0 resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                    }}
                    disabled={isPending}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isPending || !input.trim()}>
                    <Send />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
