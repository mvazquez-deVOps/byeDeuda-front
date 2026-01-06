
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash, Pencil, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/components/ui/use-toast';
import { getAllResourcesForAdmin, deleteResource } from '@/app/actions';
import type { EducationalResource } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function ContentTable() {
    const [resources, setResources] = useState<EducationalResource[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        getAllResourcesForAdmin()
            .then(setResources)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await deleteResource(id);
            setResources(prev => prev.filter(res => res.id !== id));
            toast({ title: "Éxito", description: "El recurso ha sido eliminado." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {resources.map((resource) => (
                    <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{resource.type}</Badge></TableCell>
                        <TableCell>
                            <Badge variant={resource.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                                {resource.status === 'published' ? 'Publicado' : 'Borrador'}
                            </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(resource.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</TableCell>
                        <TableCell className="text-right">
                             <Button variant="ghost" size="icon" asChild>
                                <Link href={`/resources/${resource.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                             </Button>
                             <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/content/edit/${resource.slug}`}><Pencil className="h-4 w-4" /></Link>
                             </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción es permanente y no se puede deshacer. Esto eliminará el recurso de la base de datos.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(resource.id)} className="bg-destructive hover:bg-destructive/90">
                                            Sí, eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}


export default function ContentStudioPage() {
    return (
        <>
            <PageHeader title="Gestor de Contenido" description="Crea, edita y publica artículos, podcasts y videos para tus usuarios y el público.">
                <Button asChild>
                    <Link href="/admin/content/new">
                        <PlusCircle />
                        Crear Nuevo Contenido
                    </Link>
                </Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Biblioteca de Recursos</CardTitle>
                    <CardDescription>Aquí puedes ver todos los recursos educativos de la plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ContentTable />
                </CardContent>
            </Card>
        </>
    )
}
