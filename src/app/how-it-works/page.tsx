'use client';

import { ArrowRight, CheckCircle, Shield, Scale, Bot, Users, Cpu, FileText, Handshake, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/logo';

const protocolSteps = [
    {
        icon: BrainCircuit,
        title: "Análisis Forense (La IA Diagnóstica)",
        description: "Nuestra IA escanea tus deudas, detecta cláusulas abusivas, identifica a tus acreedores y calcula tu riesgo real de demanda en segundos. No adivinamos, calculamos."
    },
    {
        icon: Shield,
        title: "El Escudo Legal (La Barrera)",
        description: "Activamos protocolos de defensa automática. Generamos respuestas legales para detener el acoso telefónico y desviamos la cobranza hacia nuestra plataforma. Tú recuperas tu paz, nosotros recibimos los golpes."
    },
    {
        icon: Handshake,
        title: "Negociación Algorítmica (El Cierre)",
        description: "Sabemos cuánto aceptó el banco ayer. Usamos datos históricos masivos para predecir el descuento máximo posible (hasta 70-80%) y lo aseguramos con un contrato validado legalmente."
    }
];

const trustFeatures = [
    {
        icon: Shield,
        title: "Encriptación AES-256",
        description: "Tus datos están blindados con la misma seguridad de nivel bancario que usa tu propia app de banco."
    },
    {
        icon: Scale,
        title: "Supervisión Humana",
        description: "La IA es rápida, pero nuestros abogados expertos revisan cada acuerdo final antes de que pagues un centavo."
    },
    {
        icon: CheckCircle,
        title: "Modelo Transparente",
        description: "Solo ganamos si tú ahorras. Nuestro modelo de éxito compartido asegura que nuestros intereses están 100% alineados con los tuyos. Sin letras chiquitas."
    }
];

export default function HowItWorksPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 overflow-x-hidden">

            <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <Logo className="invert brightness-0" />
                    <nav className="flex items-center gap-2 sm:gap-4">
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
                {/* Hero Section */}
                <section className="relative flex flex-col items-center justify-center text-center py-24 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="aurora-bg">
                            <div className="w-[500px] h-[500px] bg-blue-600 top-[10%] left-[10%] animation-delay-[-2s]"></div>
                            <div className="w-[400px] h-[400px] bg-cyan-500 bottom-[5%] right-[20%] animation-delay-[-4s]"></div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                        <h1 className="text-5xl md:text-7xl font-bold font-headline text-white leading-tight tracking-tighter mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
                            Ingeniería Legal aplicada a tu <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>Libertad Financiera.</span>
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
                            No somos un despacho tradicional. Somos un sistema operativo que combina Inteligencia Artificial con estrategia legal de alto nivel para liquidar tus deudas al menor costo posible.
                        </p>
                        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <Button asChild size="lg" className="h-14 px-8 text-lg">
                                <Link href="/register">
                                    Verificar mi primera deuda gratis
                                    <ArrowRight className="ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
                
                {/* El Protocolo A.R.C. Section */}
                <section className="py-20 lg:py-24 bg-[#111111]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-bold font-headline text-white mb-4">El Protocolo A.R.C.</h2>
                        <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">Nuestra metodología de Análisis, Resistencia y Capitalización está diseñada para darte el control total del proceso.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {protocolSteps.map((step, index) => (
                                <div key={index} className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md text-left transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-600/10">
                                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-6">
                                        <step.icon className="w-8 h-8 text-cyan-300" />
                                    </div>
                                    <h3 className="text-xl font-bold font-headline text-white mb-3">Fase {index + 1}: {step.title}</h3>
                                    <p className="text-gray-400">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-20 lg:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="text-center">
                            <h2 className="text-4xl font-bold font-headline text-white mb-4">Tecnología + Factor Humano</h2>
                            <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">La combinación perfecta de velocidad y supervisión experta. Lo mejor de ambos mundos para tu tranquilidad.</p>
                        </div>
                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                             {trustFeatures.map((feature, index) => (
                                <div key={index} className="flex flex-col items-center text-center p-6">
                                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                                        <feature.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                 <section className="py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-white leading-tight tracking-tight mb-8">
                            ¿Listo para ejecutar el protocolo?
                        </h2>
                        <Button asChild size="lg" className="h-16 px-12 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105">
                            <Link href="/register">Comenzar Ahora</Link>
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="text-center py-8 border-t border-white/10">
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
