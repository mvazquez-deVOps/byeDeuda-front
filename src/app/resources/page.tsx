
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Loader2, Search, ArrowRight, Shield, Sparkles, Home, UserPlus, FileText, Copy, BookOpen, Mic, Film, Wrench } from 'lucide-react';
import type { EducationalResource } from '@/lib/types';
import { educationalResources as allPublicResources } from '@/lib/educational-resources'; // <--- CAMBIO CLAVE
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/shared/logo';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

function ResourceCard({ resource }: { resource: EducationalResource }) {
    const { toast } = useToast();

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(resource.content);
        toast({
            title: 'Copiado al portapapeles',
            description: 'El guion está listo para que lo pegues.',
        });
    };

    return (
        <Link href={`/resources/${resource.slug}`} passHref>
            <Card className="flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg h-full text-left bg-card/80 border-border">
                <CardHeader className="p-0">
                    <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                        <Image
                            src={resource.image}
                            alt={resource.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={resource.imageHint}
                        />
                    </div>
                </CardHeader>
                <div className='p-6 flex flex-col flex-grow'>
                    <h3 className="text-lg font-bold font-headline text-white mb-2 line-clamp-2">{resource.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-3 flex-grow">{resource.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                         <Button variant="link" className="p-0 text-cyan-400">
                            {resource.type === 'script' ? 'Ver y Copiar' : 'Leer más'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        {resource.type === 'script' && !resource.isPremium && (
                            <Button onClick={handleCopy} size="sm" variant="secondary">
                                <Copy className="mr-2 h-4 w-4" /> Copiar
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    )
}

function LeadMagnetBanner() {
    return (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 my-8">
            <div className="flex-shrink-0 bg-primary/20 p-4 rounded-full">
                <Shield className="h-8 w-8 text-primary"/>
            </div>
            <div className="flex-grow text-center md:text-left">
                <h3 className="text-xl font-bold text-white">¿No tienes tiempo de leer?</h3>
                <p className="text-primary/80">Sube tu carta de cobranza y deja que nuestra IA la analice por ti en segundos.</p>
            </div>
            <Button asChild size="lg" className="flex-shrink-0">
                <Link href="/register?from=lead-magnet">
                    <Sparkles className="mr-2" />
                    Regístrate Gratis
                </Link>
            </Button>
        </div>
    )
}


export default function ResourcesPage() {
    const [resources, setResources] = useState<EducationalResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        setLoading(true);
        // Directamente usamos los recursos importados
        const publishedResources = allPublicResources.filter(r => r.status === 'published');
        setResources(publishedResources);
        setLoading(false);
    }, []);

    const filteredResources = resources.filter(resource => {
        const matchesTab = activeTab === 'all' || resource.type === activeTab;
        const matchesSearch = searchTerm.trim() === '' || 
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const resourcesWithLeadMagnet = filteredResources.reduce((acc, resource, index) => {
        acc.push(resource);
        // Insert lead magnet after every 6th item (which is index 5, 11, etc.)
        if ((index + 1) % 6 === 0 && index < filteredResources.length -1) {
            acc.push('lead-magnet');
        }
        return acc;
    }, [] as (EducationalResource | 'lead-magnet')[]);

    const TABS = [
        { value: 'all', label: 'Todos', icon: BookOpen },
        { value: 'article', label: 'Artículos', icon: FileText },
        { value: 'script', label: 'Guiones', icon: Copy },
        { value: 'guide', label: 'Guías', icon: FileText },
        { value: 'template', label: 'Plantillas', icon: FileText },
        { value: 'podcast', label: 'Podcasts', icon: Mic },
        { value: 'video', label: 'Videos', icon: Film },
        { value: 'tool', label: 'Herramientas', icon: Wrench },
    ];

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white">
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <Logo className="invert brightness-0" />
                    <nav className="flex items-center gap-4">
                         <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white hidden sm:flex">
                            <Link href="/"><Home className="mr-2" />Página Principal</Link>
                        </Button>
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-opacity">
                            <Link href="/register"><UserPlus className="mr-2" />Crear Cuenta Gratis</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                
                {/* Hero Section */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold font-headline text-white leading-tight tracking-tighter mb-4">
                        Domina tus Deudas
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-8">
                        La biblioteca de recursos definitiva para entender tus derechos, negociar con poder y recuperar tu libertad financiera.
                    </p>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input 
                            type="search"
                            placeholder="Buscar artículos, podcasts, videos..."
                            className="w-full h-14 pl-12 pr-4 text-lg bg-white/5 border-white/20 backdrop-blur-sm focus:ring-primary focus:ring-2 text-white placeholder:text-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
                    <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 max-w-5xl mx-auto h-auto flex-wrap justify-center">
                        {TABS.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value} className="flex-col md:flex-row gap-1 md:gap-2">
                                <tab.icon className="h-4 w-4"/>
                                <span>{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                
                {/* Content Grid */}
                {loading ? (
                     <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resourcesWithLeadMagnet.map((item, index) => {
                            if (item === 'lead-magnet') {
                                return <div key={`lead_${index}`} className="md:col-span-2 lg:col-span-3"><LeadMagnetBanner /></div>;
                            }
                            return <ResourceCard key={item.id} resource={item} />;
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg">
                        <h3 className="text-xl font-semibold text-primary">No se encontraron recursos</h3>
                        <p className="text-gray-400 mt-2">
                            Intenta con otra búsqueda o limpia los filtros.
                        </p>
                    </div>
                )}

            </main>
             <footer className="text-center py-8 border-t border-white/10 mt-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Bye Deuda IA. Todos los derechos reservados.</p>
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        <Link href="/terms" className="hover:text-white">Términos y Condiciones</Link>
                        <Link href="/privacy" className="hover:text-white">Aviso de Privacidad</Link>
                        <Link href="/contact" className="hover:text-white">Contacto</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
