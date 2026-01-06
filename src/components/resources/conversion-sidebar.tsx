
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';

export function ConversionSidebar() {
    return (
        <aside className="lg:col-span-3 sticky top-24">
            <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">¿Te están presionando?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Nuestras herramientas están diseñadas para darte la ventaja.</p>
                    <Button asChild className="w-full">
                        <Link href="/register?from=sidebar-cta">
                            <Shield className="mr-2" /> Activar Escudo Legal
                        </Link>
                    </Button>
                     <Button asChild variant="outline" className="w-full">
                        <Link href="/register?from=sidebar-cta&plan=vip">
                            <User className="mr-2" /> Hablar con un Asesor
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </aside>
    )
}
