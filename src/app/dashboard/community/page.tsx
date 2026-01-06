
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CreditCard, Home, Car, HandCoins, Users, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createCommunityPost, getCommunityPosts } from '@/lib/community';
import type { CommunityPost, CommunityPostCategory } from '@/lib/types';
import { PostCard } from '@/components/community/post-card';

const CATEGORIES: { name: CommunityPostCategory; icon: React.ElementType }[] = [
    { name: 'Tarjetas de Crédito', icon: CreditCard },
    { name: 'Préstamos Personales', icon: HandCoins },
    { name: 'Automotriz', icon: Car },
    { name: 'Hipotecario', icon: Home },
    { name: 'Apps y Montadeudas', icon: HandCoins },
];


function CreatePostBox({ onPostCreated }: { onPostCreated: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CommunityPostCategory>('Tarjetas de Crédito');
    
    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !user) return;

        setIsSubmitting(true);
        try {
            await createCommunityPost({
                content: newPostContent,
                category: selectedCategory,
                authorId: user.uid,
                authorName: user.name || 'Usuario Anónimo',
                authorAvatar: user.avatarUrl || '',
                authorPlan: user.plan || 'Básico',
            });
            setNewPostContent('');
            onPostCreated();
            toast({
                title: '¡Publicación Creada!',
                description: 'Tu mensaje y el análisis de la IA ahora son visibles para la comunidad.',
            });
        } catch (error) {
            console.error('Error creating post:', error);
            toast({
                variant: 'destructive',
                title: 'Error al Publicar',
                description: 'No se pudo crear tu publicación. Inténtalo de nuevo.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Comparte con la Comunidad</CardTitle>
                <CardDescription>Haz una pregunta o comparte tu experiencia.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full gap-4">
                    <Textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Escribe aquí tu pregunta o comparte tu progreso..."
                        rows={5}
                        disabled={!user || isSubmitting}
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Categoría</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <Button 
                                    key={cat.name} 
                                    variant={selectedCategory === cat.name ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat.name)}
                                >
                                    <cat.icon className="mr-2 h-4 w-4" />
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleCreatePost} 
                    disabled={isSubmitting || !newPostContent.trim() || !user}
                    className="w-full"
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    Publicar
                </Button>
            </CardFooter>
        </Card>
    );
}

function CategoryFilters({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (category: CommunityPostCategory | 'Todas') => void}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Categorías</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button 
                    variant={activeCategory === 'Todas' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveCategory('Todas')}
                >
                    <Users className="mr-2 h-4 w-4"/> Todas
                </Button>
                {CATEGORIES.map(cat => (
                    <Button 
                        key={cat.name}
                        variant={activeCategory === cat.name ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveCategory(cat.name)}
                    >
                        <cat.icon className="mr-2 h-4 w-4"/> {cat.name}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}


export default function CommunityPage() {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [activeCategory, setActiveCategory] = useState<CommunityPostCategory | 'Todas'>('Todas');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoadingPosts(true);
        const unsubscribe = getCommunityPosts((newPosts) => {
            setPosts(newPosts);
            setIsLoadingPosts(false);
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);
    
    const filteredPosts = posts.filter(post => {
        const matchesCategory = activeCategory === 'Todas' || post.category === active-category;
        const matchesSearch = searchTerm.trim() === '' || post.content.toLowerCase().includes(searchTerm.toLowerCase()) || post.authorName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <PageHeader
                title="Comunidad Bye Deuda"
                description="Conéctate, comparte y aprende con otros que están en el mismo camino."
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMNA IZQUIERDA (Categorías) */}
                <aside className="hidden lg:block lg:col-span-3 sticky top-4">
                     <CategoryFilters activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                </aside>

                {/* COLUMNA CENTRAL (Feed) */}
                <main className="col-span-1 lg:col-span-6 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar en la comunidad..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <CreatePostBox onPostCreated={() => { /* Could trigger a refetch or scroll to top */}}/>
                    
                    {isLoadingPosts ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="space-y-4">
                            {filteredPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-semibold text-primary">No se encontraron publicaciones</h3>
                            <p className="text-muted-foreground mt-2">
                               {searchTerm ? `Intenta con otra búsqueda o limpia los filtros.` : `¡Sé el primero en compartir algo en "${activeCategory}"!`}
                            </p>
                        </div>
                    )}
                </main>

                {/* COLUMNA DERECHA (Sidebar) */}
                <aside className="lg:col-span-3 hidden lg:block sticky top-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Temas Populares</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Próximamente...</p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </>
    );
}
