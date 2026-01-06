'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/shared/logo';
import { createUserWithEmailAndPassword } from 'firebase/auth';
// Importamos auth desde tu archivo corregido
import { auth } from '@/lib/init-firebase'; 
// Importamos la función para crear la cookie de sesión
import { createUserProfile } from '@/lib/user';
import { setSessionCookie } from '@/components/auth/auth-provider'; 
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  phone: z.string().min(10, { message: 'Por favor, introduce un número de teléfono válido.' }),
  debtRange: z.string({ required_error: 'Por favor, selecciona un rango de deuda.'}),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  
  // Estado para bloquear la UI durante la redirección
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      debtRange: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsRedirecting(true); // Bloquear botón

      // 1. Crear usuario en Firebase Auth (Cliente)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // 2. Crear perfil en Firestore
      await createUserProfile({
        uid: user.uid,
        email: user.email,
        name: values.name,
        phone: values.phone,
        debtRange: values.debtRange,
      });

      // 3. CRÍTICO: Crear la Cookie de Sesión para el Servidor
      await setSessionCookie(user);

      toast({
        title: '¡Registro Exitoso!',
        description: '¡Bienvenido! Serás redirigido en un momento.',
      });
      
      // 4. Refrescar router para que el servidor vea la cookie
      router.refresh();

      // 5. Redirigir
      if (plan) {
        router.push(`/dashboard/subscription?plan=${plan}`);
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      setIsRedirecting(false); // Desbloquear si falla
      
      let errorMessage = 'Ocurrió un error inesperado durante el registro.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está en uso. Por favor, inicia sesión o usa un email diferente.';
      }
      toast({
        variant: 'destructive',
        title: 'Fallo en el Registro',
        description: errorMessage,
      });
    }
  }

  // Si está redirigiendo, mostramos pantalla de carga
  if (isRedirecting) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-black">
           <Loader2 className="h-10 w-10 animate-spin text-primary" />
       </div>
   );
 }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo />
            </div>
          <CardTitle>Crea tu Cuenta</CardTitle>
          <CardDescription>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inicia Sesión
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Ej. 55 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="debtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Total de tu Deuda</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rango aproximado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="<25k">Menos de $25,000</SelectItem>
                          <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                          <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                          <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                          <SelectItem value=">250k">Más de $250,000</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isRedirecting}>
                {form.formState.isSubmitting || isRedirecting ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}