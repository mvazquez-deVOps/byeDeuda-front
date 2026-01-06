
'use client';

import { useEffect, useState, useRef, useTransition } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Loader2,
  Mail,
  Send,
  User as UserIcon,
  Sparkles,
  Lock,
  Bot
} from 'lucide-react';
import type { Notification, ChatMessage } from '@/lib/types';
import { getNotifications, markNotificationAsRead, sendChatMessage, getUserChatThread } from '@/app/actions';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { getMessagesForThread } from '@/lib/chat';
import Link from 'next/link';

const notificationIcons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <AlertCircle className="h-5 w-5 text-blue-500" />,
};

function NotificationsTab({ notifications, loading, onMarkAsRead }: { notifications: Notification[]; loading: boolean; onMarkAsRead: (id: string) => void; }) {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4">
            <Skeleton className="h-6 w-6 mt-1 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold text-primary">Buzón Vacío</h3>
        <p className="text-muted-foreground mt-2">
          No tienes notificaciones nuevas en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={cn(
            'flex items-start space-x-4 p-4 rounded-lg transition-colors',
            !notif.isRead && 'bg-muted/50'
          )}
        >
          <div className="mt-1">{notificationIcons[notif.type]}</div>
          <div className="flex-1">
            <h4 className="font-semibold">{notif.title}</h4>
            <p className="text-sm text-muted-foreground">{notif.message}</p>
            <time className="text-xs text-muted-foreground/80 mt-1 block">
              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
            </time>
            {notif.link && (
              <Button variant="link" asChild className="p-0 h-auto mt-2">
                <Link href={notif.link}>Ver detalles</Link>
              </Button>
            )}
          </div>
          {!notif.isRead && (
            <Button variant="outline" size="sm" onClick={() => onMarkAsRead(notif.id)}>
              Marcar como leído
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}


function LockedChat() {
    return (
        <Card className="h-[calc(100vh-18rem)] flex flex-col items-center justify-center text-center p-8">
             <Lock className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-2xl font-bold font-headline mb-2 text-amber-300">Comunicación Directa con Expertos</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
                Accede a un chat privado con nuestros abogados y negociadores para recibir asesoría personalizada sobre tu caso.
            </p>
            <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:brightness-110">
                <Link href="/dashboard/subscription">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Mejorar a Plan VIP
                </Link>
            </Button>
        </Card>
    )
}

function ChatTab() {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    getUserChatThread().then(thread => {
        if (thread) {
            setThreadId(thread.id);
            const unsubscribe = getMessagesForThread(thread.id, (newMessages) => {
                setMessages(newMessages);
                setIsLoading(false);
                // markThreadAsReadForRole(thread.id, 'user');
            });
            return () => unsubscribe();
        } else {
            setThreadId(`thread_for_${user.uid}`);
            setIsLoading(false);
            setMessages([{
                id: 'initial',
                threadId: `thread_for_${user.uid}`,
                content: 'Bienvenido a tu chat directo con tu asesor. Escribe tu primer mensaje para iniciar la conversación.',
                senderId: 'system',
                senderRole: 'system',
                createdAt: new Date(),
            } as ChatMessage]);
        }
    });

  }, [user]);

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

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !role || !threadId) return;
    setIsSending(true);
    
    try {
        await sendChatMessage({
            threadId: threadId,
            content: input,
        });
        setInput('');
    } catch (error) {
        console.error("Error sending message:", error);
    } finally {
        setIsSending(false);
    }
  }


  return (
    <Card className="h-[calc(100vh-18rem)] flex flex-col">
        <CardHeader>
            <CardTitle>Chat con tu Asesor</CardTitle>
            <CardDescription>Comunícate directamente con tu estratega de deuda asignado.</CardDescription>
        </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn("flex items-start gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
                     {i % 2 === 0 && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                     <div className="bg-muted rounded-lg p-3 w-60">
                        <div className="space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></div>
                     </div>
                     {i % 2 !== 0 && <Avatar className="w-8 h-8"><AvatarFallback>U</AvatarFallback></Avatar>}
                </div>
            ))}
            {!isLoading && messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex items-start gap-3', msg.senderRole !== 'user' ? 'justify-start' : 'justify-end')}
              >
                {msg.senderRole !== 'user' && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                <div
                  className={cn(
                    'max-w-md rounded-lg p-3 text-sm',
                    msg.senderRole === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                   <time className={cn("text-xs opacity-70 mt-1", msg.senderRole === 'user' ? 'text-right' : 'text-left')}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: es })}
                    </time>
                </div>
                {msg.senderRole === 'user' && user && (
                    <Avatar className="w-8 h-8"><AvatarFallback>{getInitials(user.name)}</AvatarFallback></Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center gap-3">
          <Textarea
            placeholder="Escribe tu mensaje aquí..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
            rows={1}
            className="min-h-0 resize-none"
            disabled={isLoading || isSending}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isLoading || isSending || !input.trim()}>
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function InboxPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const hasVipPlan = user?.plan === 'Asesoría Personalizada VIP';

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getNotifications()
      .then(setNotifications)
      .catch(error => console.error("Failed to fetch inbox data:", error))
      .finally(() => setLoading(false));
  }, [user]);

  const handleMarkAsRead = (notificationId: string) => {
    if (!user) return;
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    
    startTransition(async () => {
      await markNotificationAsRead(notificationId);
    });
  };

  return (
    <>
      <PageHeader
        title="Buzón de Estrategia"
        description="Aquí encontrarás todas las comunicaciones importantes de tu equipo y del sistema."
      />
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" /> Notificaciones
          </TabsTrigger>
          <TabsTrigger value="chat">
            <Mail className="mr-2 h-4 w-4" /> Chat con Asesor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notifications">
            <Card>
                <CardHeader>
                    <CardTitle>Alertas y Actualizaciones</CardTitle>
                    <CardDescription>Actualizaciones automáticas sobre tus negociaciones y acciones requeridas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NotificationsTab 
                      notifications={notifications} 
                      loading={loading}
                      onMarkAsRead={handleMarkAsRead}
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="chat">
          {hasVipPlan ? <ChatTab /> : <LockedChat />}
        </TabsContent>
      </Tabs>
    </>
  );
}
