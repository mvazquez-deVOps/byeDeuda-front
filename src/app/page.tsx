'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Shield, Handshake, Lock, Users, Clock, Scan, Sparkles } from 'lucide-react';
import Logo from '@/components/shared/logo';
import { useRouter } from 'next/navigation';
import { PLANS } from '@/lib/plans';
import type { EducationalResource } from '@/lib/types';
import { getPublicResources } from '@/lib/public-data';
import Image from 'next/image';

const processFeatures = [
  {
    icon: Scan,
    title: "Diagnóstico Profundo",
    description: "Nuestra IA analiza tu ADN Financiero y detecta irregularidades en tu cobranza."
  },
  {
    icon: Shield,
    title: "Escudo Legal",
    description: "Detenemos el acoso. Generamos defensas automáticas ante llamadas y amenazas."
  },
  {
    icon: Handshake,
    title: "Negociación Maestra",
    description: "Entrena en nuestro Dojo y usa nuestros scripts para pagar hasta un 70% menos."
  }
];

const trustFeatures = [
    { icon: Lock, text: "Encriptación de Nivel Bancario" },
    { icon: Users, text: "Expertos Humanos de Respaldo" },
    { icon: Clock, text: "Monitoreo 24/7" },
];


function RecentResources() {
    const [resources, setResources] = useState<EducationalResource[]>([]);

    useEffect(() => {
      const fetchResources = async () => {
          try {
              // 1. Llamamos a tu nuevo archivo seguro
              const data = await getPublicResources();
              
              // 2. Filtramos y ordenamos igual que antes
              const publishedArticles = data
                  .filter((r: any) => r.type === 'article') // Asegúrate de que tus datos tengan la propiedad 'published' si filtrabas por ella
                  .slice(0, 3);
              
              setResources(publishedArticles);
          } catch (error) {
              console.error("Error cargando recursos:", error);
          }
      };

      fetchResources();
  }, []);

    if (resources.length === 0) return null;

    return (
        <section className="py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-bold font-headline text-white mb-4">Aprende con Bye Deuda</h2>
                <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">Descubre estrategias y consejos de expertos para manejar tus finanzas y salir de deudas.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {resources.map((resource) => (
                      <Link key={resource.slug} href={`/resources/${resource.slug}`} passHref>
                        <Card className="flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg h-full text-left bg-white/5 border-white/10">
                          <CardHeader className="p-0">
                            <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
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
                            <CardFooter className="p-0 pt-4 mt-auto">
                                <Button variant="link" className="p-0 text-cyan-400">
                                    Leer más
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                          </div>
                        </Card>
                      </Link>
                    ))}
                </div>
                 <Button asChild variant="outline" className="mt-12 text-lg h-12 px-8 border-white/20 text-white hover:bg-white/10 hover:text-white">
                    <Link href="/resources">Explorar todos los recursos</Link>
                </Button>
            </div>
        </section>
    );
}


export default function Home() {
  const [debtAmount, setDebtAmount] = useState('');
  const router = useRouter();

  const handlePlanGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/register');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 overflow-x-hidden">
      
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Logo className="invert brightness-0" />
          <nav className="flex items-center gap-2 sm:gap-4">
             <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white hidden sm:flex">
              <Link href="/how-it-works">Cómo Funciona</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white hidden sm:flex">
              <Link href="/resources">Recursos</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white hidden sm:flex">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-opacity">
              <Link href="/register">Comenzar Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative flex flex-col items-center justify-center text-center py-24 lg:py-32 min-h-[90vh] overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#0a0a0a]"></div>
             <div className="aurora-bg">
                <div className="w-[500px] h-[500px] bg-blue-600 top-[10%] left-[10%] animation-delay-[-2s]"></div>
                <div className="w-[400px] h-[400px] bg-cyan-500 bottom-[5%] right-[20%] animation-delay-[-4s]"></div>
             </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <h1 className="text-5xl md:text-7xl font-bold font-headline text-white leading-tight tracking-tighter mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
              Recupera tu vida. <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>
                Sal de deudas.
              </span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
              La primera plataforma con IA que negocia por ti, detiene el acoso y organiza tu libertad financiera.
            </p>

            <div className="max-w-2xl mx-auto fade-in-up" style={{ animationDelay: '0.4s' }}>
              <form onSubmit={handlePlanGeneration} className="relative">
                <Input
                  type="text"
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                  placeholder="¿Cuánto debes aproximadamente? (ej. $50,000)"
                  className="w-full h-16 pl-6 pr-48 text-lg bg-white/5 border-white/20 backdrop-blur-sm focus:ring-primary focus:ring-2 text-white placeholder:text-gray-500"
                />
                <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-opacity">
                  Crear mi Plan <ArrowRight className="ml-2 hidden sm:inline" />
                </Button>
              </form>
               <p className="text-sm text-gray-500 mt-4">Más de 10,000 latinos ya duermen tranquilos.</p>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-[#0a0a0a]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-bold font-headline text-white mb-4">Tu Camino a la Libertad Financiera</h2>
                <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">Transformamos la complejidad de las deudas en un plan de acción simple y automatizado.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {processFeatures.map((feature, index) => (
                        <div key={index} className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-600/10">
                            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4">
                                <feature.icon className="w-8 h-8 text-cyan-300" />
                            </div>
                            <h3 className="text-xl font-bold font-headline text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
                
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                    {trustFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 text-gray-400">
                            <feature.icon className="w-5 h-5 text-green-400" />
                            <span className="font-medium">{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>


        <section className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-bold font-headline text-white mb-4">Elige tu plan de libertad.</h2>
                <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">Invierte en tu tranquilidad. Cancela cuando quieras.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 justify-center items-start gap-8">
                    <Card className="w-full bg-[#111111] border-white/10 p-2 transform hover:-translate-y-2 transition-transform duration-300">
                        <CardContent className="p-6">
                            <h3 className="text-2xl font-bold font-headline text-white mb-2">Plan Básico</h3>
                            <p className="text-gray-400 mb-6 min-h-[40px]">Para organizar el caos y dar el primer paso.</p>
                            <p className="text-5xl font-extrabold text-white mb-6">$0 <span className="text-lg font-medium text-gray-500">/ mes</span></p>
                            <ul className="space-y-3 text-left mb-8">
                                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-gray-500" /><span>Registro de 1 deuda</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-gray-500" /><span>Diagnóstico de riesgo básico</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-gray-500" /><span>Acceso a la comunidad</span></li>
                            </ul>
                            <Button asChild variant="outline" className="w-full h-12 text-lg bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                                <Link href="/register">Crear cuenta gratis</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="relative w-full transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                        <Card className="relative bg-[#111111] border-white/20 p-2">
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">MÁS POPULAR</div>
                            </div>
                            <CardContent className="p-6">
                                <h3 className="text-2xl font-bold font-headline text-white mb-2">{PLANS.BASIC.name}</h3>
                                <p className="text-cyan-300 mb-6 min-h-[40px]">Para autogestionar tus deudas con el poder de la IA.</p>
                                <p className="text-5xl font-extrabold text-white mb-6">${PLANS.BASIC.price} <span className="text-lg font-medium text-gray-400">mensuales</span></p>
                                
                                <ul className="space-y-3 text-left mb-8">
                                    {PLANS.BASIC.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-cyan-400" /><span>{feature}</span></li>
                                    ))}
                                </ul>
                                <Button asChild className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <Link href={`/register?plan=${PLANS.BASIC.priceId}`}>Comenzar Autogestión</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="w-full bg-[#111111] border-white/10 p-2 transform hover:-translate-y-2 transition-transform duration-300">
                        <CardContent className="p-6">
                            <h3 className="text-2xl font-bold font-headline text-white mb-2">{PLANS.VIP.name}</h3>
                            <p className="text-gray-400 mb-6 min-h-[40px]">Delega todo a nuestros expertos. Nosotros negociamos por ti.</p>
                            <p className="text-5xl font-extrabold text-white mb-6">${PLANS.VIP.price} <span className="text-lg font-medium text-gray-400">mensuales</span></p>
                            <ul className="space-y-3 text-left mb-8">
                                {PLANS.VIP.features.map((feature, i) => (
                                     <li key={i} className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-amber-400" /><span>{feature}</span></li>
                                ))}
                            </ul>
                            <Button asChild variant="outline" className="w-full h-12 text-lg border-amber-400/50 text-amber-400 hover:bg-amber-400/10 hover:text-amber-300">
                                <Link href={`/register?plan=${PLANS.VIP.priceId}`}>Solicitar Asesoría</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <RecentResources />

        <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-white leading-tight tracking-tight mb-8">
                    ¿Listo para dormir tranquilo otra vez?
                </h2>
                <Button asChild size="lg" className="h-16 px-12 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105">
                    <Link href="/register">Empezar Ahora</Link>
                </Button>
            </div>
        </section>
      </main>

      <footer className="text-center py-8 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Bye Deuda IA. Todos los derechos reservados.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
                <Link href="/how-it-works" className="hover:text-white">Cómo Funciona</Link>
                <Link href="/terms" className="hover:text-white">Términos y Condiciones</Link>
                <Link href="/privacy" className="hover:text-white">Aviso de Privacidad</Link>
                <Link href="/contact" className="hover:text-white">Contacto</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
