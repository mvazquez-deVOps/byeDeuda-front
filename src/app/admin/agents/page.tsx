

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/shared/page-header';
import { withAuth } from '@/components/auth/with-auth';
import { Loader2, UserPlus } from 'lucide-react';
import { createUser } from '@/lib/admin-actions';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { PLANS } from '@/lib/plans';

const formSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  role: z.enum(['user', 'agent', 'superadmin']),
  plan: z.string(),
});

function CreateUserPage() {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
      plan: 'Básico',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    if (!firebaseUser) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: 'No hay una sesión activa en el navegador. Por favor, vuelve a iniciar sesión.',
      });
      setIsSubmitting(false);
      return;
    }
    
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('role', values.role);
    formData.append('plan', values.plan);

    try {
      const result = await createUser(formData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user.');
      }

      toast({
        title: 'Usuario Creado Exitosamente',
        description: `El usuario ${values.name} ha sido creado con el rol '${values.role}'.`,
      });
      form.reset();
      
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Crear Usuario',
        description: error.message || 'Ocurrió un error inesperado.',
      });
    } finally {
       setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Crear Nuevo Usuario"
        description="Añade un nuevo usuario a la plataforma con un rol y plan específicos."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Detalles del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Smith" {...field} />
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
                      <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este será el email de inicio de sesión del usuario.
                    </FormDescription>
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
                    <FormDescription>
                      El usuario deberá usar esta contraseña para su primer inicio de sesión.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Rol del Usuario</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="agent">Agente</SelectItem>
                            <SelectItem value="superadmin">Superadministrador</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Plan de Suscripción</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un plan" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Básico">Básico (Gratis)</SelectItem>
                                <SelectItem value={PLANS.BASIC.name}>{PLANS.BASIC.name}</SelectItem>
                                <SelectItem value={PLANS.VIP.name}>{PLANS.VIP.name}</SelectItem>
                                <SelectItem value="staff">Staff (Interno)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
               </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Creando Usuario...' : 'Crear Usuario'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

// Protect this page and only allow superadmins
export default withAuth(CreateUserPage, ['superadmin']);
