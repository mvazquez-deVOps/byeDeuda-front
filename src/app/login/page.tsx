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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/shared/logo';
import { signInWithEmailAndPassword } from 'firebase/auth';
// Asegúrate de que este import apunte a tu archivo renombrado correctamente
import { auth, db } from '@/lib/init-firebase'; 
import { useAuth, setSessionCookie } from '@/components/auth/auth-provider';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(1, { message: 'La contraseña no puede estar vacía.' }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  // Añadimos estado local de carga para manejar la transición post-login
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user, role, loading: authLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Redirección automática si ya hay sesión
  useEffect(() => {
    if (!authLoading && user && role) {
        if (role === 'superadmin' || role === 'agent') {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    }
  }, [user, role, authLoading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsRedirecting(true); // Bloqueamos la UI mientras procesamos

      // 1. Login en Firebase Client (Google)
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // 2. Crear la Cookie de Sesión (Puente al Servidor)
      // Esta función debe llamar a tu API /api/auth/session
      await setSessionCookie(userCredential.user);

      // 3. OBTENER EL ROL
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userRole = userDoc.exists() ? userDoc.data().role : 'user';
      
      toast({
        title: '¡Bienvenido de vuelta!',
        description: 'Has iniciado sesión correctamente. Redirigiendo...',
      });

      // 4. CRÍTICO: Refrescar el router para que el Servidor vea la nueva Cookie
      router.refresh(); 
      
      // 5. Redirigir según el rol
      if (userRole === 'superadmin' || userRole === 'agent') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      console.error('Login error:', error);
      setIsRedirecting(false); // Liberamos la UI si falla
      
      let errorMessage = 'Credenciales incorrectas.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email o contraseña incorrectos.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde.';
      }

      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: errorMessage,
      });
    }
  }
  
  if (authLoading || user || isRedirecting) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 invert brightness-0">
                <Logo />
            </div>
          <CardTitle className="text-white">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-blue-400 hover:underline">
              Regístrate
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} className="bg-black border-gray-700 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-black border-gray-700 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={form.formState.isSubmitting || isRedirecting}>
                {form.formState.isSubmitting || isRedirecting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                    </>
                ) : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
