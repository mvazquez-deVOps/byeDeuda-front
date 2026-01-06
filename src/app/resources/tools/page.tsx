
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Loader2, Search, ArrowRight, Shield, Sparkles, Home, UserPlus, FileText, Copy, BookOpen, Mic, Film, Wrench, Lock } from 'lucide-react';
import type { EducationalResource } from '@/lib/types';
import { educationalResources as allPublicResources } from '@/lib/educational-resources'; // <--- CAMBIO CLAVE
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';

function ToolCard({ resource }: { resource: EducationalResource }) {
    const { user } = useAuth();
    const isUserPremium = user?.plan !== 'Básico';
    const isLocked = resource.isPremium && !isUserPremium;

    const iconMap = {
        'calculadora-bola-nieve-avalancha': BookOpen,
        'simulador-quitas-reales': Shield,
        'presupuesto-de-guerra': FileText,
        'auditor-gastos-hormiga': Mic,
        'calculadora-nomina-inembargable': Shield,
        'simulador-costo-oportunidad': Sparkles,
    }

    const Icon = iconMap[resource.slug as keyof typeof iconMap] || Wrench;

    return (
        <Link href={`/resources/tools/${resource.slug}`} passHref>
            <Card className="flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg h-full text-left bg-card/80 border-border group">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="p-3 bg-primary/10 rounded-lg">
                           <Icon className="w-8 h-8 text-primary" />
                        </div>
                        {isLocked && <Lock className="w-5 h-5 text-amber-400" />}
                    </div>
                </CardHeader>
                <div className='p-6 pt-0 flex flex-col flex-grow'>
                    <h3 className="text-xl font-bold font-headline text-white mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-400 flex-grow">{resource.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                         <Button variant="link" className="p-0 text-cyan-400">
                            Abrir Herramienta
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

export default function ToolsHubPage() {
    const [tools, setTools] = useState<EducationalResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Directamente filtramos los recursos importados
        const toolResources = allPublicResources.filter(r => r.type === 'tool' && r.status === 'published');
        setTools(toolResources);
        setLoading(false);
    }, []);

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white">
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <Logo className="invert brightness-0" />
                    <nav className="flex items-center gap-4">
                         <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white hidden sm:flex">
                            <Link href="/resources"><Home className="mr-2" />Ver todos los Recursos</Link>
                        </Button>
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-opacity">
                            <Link href="/register"><UserPlus className="mr-2" />Crear Cuenta Gratis</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold font-headline text-white leading-tight tracking-tighter mb-4">
                        Centro de Herramientas Financieras
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-8">
                       Calculadoras y simuladores para darte el control total de tus finanzas. Visualiza el impacto de tus decisiones.
                    </p>
                </header>

                {loading ? (
                     <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : tools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tools.map((tool) => <ToolCard key={tool.id} resource={tool} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg">
                        <h3 className="text-xl font-semibold text-primary">No hay herramientas disponibles</h3>
                        <p className="text-gray-400 mt-2">
                           Estamos trabajando en nuevas herramientas. ¡Vuelve pronto!
                        </p>
                    </div>
                )}
            </main>
             <footer className="text-center py-8 border-t border-white/10 mt-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Bye Deuda IA. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
