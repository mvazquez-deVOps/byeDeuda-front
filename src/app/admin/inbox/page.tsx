
'use client';

import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { withAuth } from '@/components/auth/with-auth';
import type { ChatThread, ChatMessage } from '@/lib/types';
import { getChatThreadsForAdmin, sendChatMessage, markThreadAsReadForRole } from '@/app/actions';
import { getMessagesForThread } from '@/lib/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

function ChatThreadList({ threads, activeThreadId, setActiveThreadId, loading }: { threads: ChatThread[], activeThreadId: string | null, setActiveThreadId: (id: string) => void, loading: boolean }) {
    if (loading) {
        return (
            <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (threads.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Aún no hay conversaciones.
            </div>
        )
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 p-2">
                {threads.map(thread => (
                    <button
                        key={thread.id}
                        onClick={() => setActiveThreadId(thread.id)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg text-left transition-colors w-full",
                            activeThreadId === thread.id ? "bg-muted" : "hover:bg-muted/50"
                        )}
                    >
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={thread.userAvatar} alt={thread.userName} />
                            <AvatarFallback>{thread.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold truncate">{thread.userName}</p>
                                {thread.unreadByAdmin > 0 && (
                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
    )
}

function ChatConsole({ activeThreadId }: { activeThreadId: string | null }) {
    const { user, role } = useAuth();
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSending, setIsSending] = React.useState(false);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const [currentThread, setCurrentThread] = React.useState<ChatThread | null>(null);


    React.useEffect(() => {
        if (!activeThreadId) {
            setMessages([]);
            return;
        };

        setIsLoading(true);
        const unsubscribe = getMessagesForThread(activeThreadId, (newMessages) => {
            setMessages(newMessages);
            setIsLoading(false);
            if (role) {
                 markThreadAsReadForRole(activeThreadId, role);
            }
        });

        return () => unsubscribe();
    }, [activeThreadId, role]);

    React.useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || !user || !role || !activeThreadId || !currentThread) return;

        setIsSending(true);
        try {
            await sendChatMessage({
                threadId: activeThreadId,
                content: input,
                senderId: user.uid,
                senderRole: role,
                userId: currentThread.userId,
                userName: currentThread.userName,
                userAvatar: currentThread.userAvatar,
            });
            setInput('');
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    }
    
    if (!activeThreadId) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground">
                <p>Selecciona una conversación</p>
                <p className="text-sm">para empezar a chatear.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                    {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
                    {messages.map(msg => {
                        const isAgent = msg.senderRole === 'agent' || msg.senderRole === 'superadmin';
                        return (
                            <div key={msg.id} className={cn('flex items-start gap-3', isAgent ? 'justify-end' : 'justify-start')}>
                                {!isAgent && (
                                     <Avatar className="w-8 h-8"><AvatarImage src={(messages.find(m => m.senderRole === 'user') as any)?.userAvatar} /><AvatarFallback><UserIcon /></AvatarFallback></Avatar>
                                )}
                                <div className={cn('max-w-md rounded-lg p-3 text-sm', isAgent ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <p className={cn("text-xs opacity-70 mt-1", isAgent ? "text-right" : "text-left")}>
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                                {isAgent && (
                                    <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                                )}
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
            <div className="border-t p-4">
                <div className="flex w-full items-center gap-2">
                    <Textarea
                        placeholder="Escribe tu respuesta como agente..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        rows={1}
                        className="min-h-0 resize-none"
                        disabled={isSending}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={isSending || !input.trim()}>
                        {isSending ? <Loader2 className="animate-spin" /> : <Send />}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function AdminInboxPage() {
    const [threads, setThreads] = React.useState<ChatThread[]>([]);
    const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setLoading(true);
        setError(null);
        getChatThreadsForAdmin()
            .then(fetchedThreads => {
                const sortedThreads = [...fetchedThreads].sort((a, b) => {
                    const dateA = new Date(a.updatedAt).getTime();
                    const dateB = new Date(b.updatedAt).getTime();
                    return dateB - dateA;
                });
                setThreads(sortedThreads);
                if (sortedThreads.length > 0 && !activeThreadId) {
                    setActiveThreadId(sortedThreads[0].id);
                }
            })
            .catch(err => {
                console.error("Failed to fetch or sort threads:", err);
                setError(err.message || 'No se pudieron cargar los hilos de conversación.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSetActiveThread = (id: string) => {
        setActiveThreadId(id);
        const thread = threads.find(t => t.id === id);
        if (thread) {
            const newThreads = threads.map(t => t.id === id ? { ...t, unreadByAdmin: 0 } : t);
            setThreads(newThreads);
        }
    };

    return (
        <>
            <PageHeader
                title="Buzón Maestro"
                description="Gestiona todas las conversaciones con los usuarios de la plataforma."
            />
            {error ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Error al Cargar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">{error}</p>
                        <p className="text-muted-foreground mt-2">No se pudieron obtener las conversaciones desde la base de datos. Por favor, revisa la conexión o los logs del servidor.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="h-[calc(100vh-14rem)]">
                    <div className="grid grid-cols-12 h-full">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r">
                            <CardHeader>
                                <CardTitle className="font-semibold text-lg">Conversaciones</CardTitle>
                            </CardHeader>
                            <ChatThreadList 
                                threads={threads} 
                                activeThreadId={activeThreadId}
                                setActiveThreadId={handleSetActiveThread}
                                loading={loading}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-9">
                            <ChatConsole activeThreadId={activeThreadId} />
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}

export default withAuth(AdminInboxPage, ['superadmin', 'agent']);
