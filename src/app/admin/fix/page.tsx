
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import { forceSuperAdminRole } from '@/lib/admin-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FixPermissionsPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForceAdmin = async () => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, ingresa un correo electrónico.' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await forceSuperAdminRole(email);
      if (result.success) {
        toast({ title: 'Éxito', description: result.message });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error al forzar rol', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Herramienta de Reparación de Permisos</CardTitle>
          <CardDescription>
            Usa esta página para asignar el rol de 'superadmin' a un usuario existente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Advertencia de Seguridad</AlertTitle>
            <AlertDescription>
              Esta es una herramienta de alto privilegio. Úsala solo si sabes lo que estás haciendo.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Correo del Usuario a Promover
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@byedeuda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleForceAdmin} disabled={isLoading || !email} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            {isLoading ? 'Asignando Rol...' : 'Convertir en Superadmin'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
