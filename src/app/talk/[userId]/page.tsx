
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/init-firebase';
import type { User } from '@/lib/types';
import Logo from '@/components/shared/logo';
import { Handshake, Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  debtorName: z.string().min(3, 'El nombre del deudor es requerido.'),
  originalAmount: z.coerce.number().positive('El monto debe ser un número positivo.'),
  offerAmount: z.coerce.number().positive('La oferta debe ser un número positivo.'),
  creditorName: z.string().min(3, 'El nombre del acreedor es requerido.'),
  message: z.string().optional(),
});

export default function DigitalShieldPage() {
  const { toast } = useToast();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      debtorName: '',
      originalAmount: 0,
      offerAmount: 0,
      creditorName: '',
      message: '',
    },
  });

  useEffect(() => {
    if (!userId) {
      setError('ID de usuario no proporcionado.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          form.setValue('debtorName', userData.name || '');
        } else {
          setError('El perfil de usuario especificado no existe.');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('No se pudo verificar la identidad del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'negotiations'), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        status: 'pending_assignment',
        ...values,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Propuesta Enviada Exitosamente',
        description: `Tu oferta para ${values.debtorName} ha sido registrada y será revisada por un agente.`,
      });
      form.reset({
        ...form.getValues(),
        originalAmount: 0,
        offerAmount: 0,
        message: '',
      });
    } catch (e) {
      console.error('Error submitting negotiation:', e);
      toast({
        variant: 'destructive',
        title: 'Error al Enviar la Propuesta',
        description: 'Hubo un problema al registrar tu oferta. Por favor, intenta de nuevo.',
      });
    }
  }
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <div className="mx-auto mb-6">
            <Logo />
        </div>
      {error || !user ? (
        <Alert variant="destructive" className="max-w-xl">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Error de Verificación</AlertTitle>
            <AlertDescription>
                {error || 'No se pudo cargar el perfil del Escudo Digital.'}
            </AlertDescription>
        </Alert>
      ) : (
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Canal de Comunicación Oficial</CardTitle>
            <CardDescription>
              El usuario <span className="font-bold text-primary">{user.name}</span> está representado por Bye Deuda IA. Toda comunicación referente a deudas debe realizarse a través de este medio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="creditorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa o Despacho que Representas</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Sertec, Muñoz y Asociados" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="debtorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿A quién buscas?</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo del deudor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="originalAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Monto Original de la Deuda</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ej. 25000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="offerAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Oferta de Quita / Descuento</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ej. 7500" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 </div>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje y Detalles de la Oferta</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe los términos de la oferta, fechas de vencimiento, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Opcional: Si tienes una carta convenio, súbela a un servicio como Google Drive y pega el enlace aquí.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  <Handshake className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? 'Enviando Propuesta...' : 'Enviar Propuesta de Negociación'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
