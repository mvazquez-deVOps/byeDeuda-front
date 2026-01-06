
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Loader2, Save, ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { getResourceBySlugForAdmin, upsertResource } from '@/app/actions';
import type { EducationalResource } from '@/lib/types';


const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  slug: z.string().optional(),
  type: z.enum(['article', 'podcast', 'video']),
  status: z.enum(['draft', 'published']),
  content: z.string().min(20, "El contenido es muy corto."),
  mediaUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  image: z.string().url("Debe ser una URL de imagen válida."),
  imageHint: z.string().optional(),
  description: z.string().min(10, "La descripción es muy corta.").max(160, "La descripción no debe exceder los 160 caracteres."),
  isPremium: z.boolean().default(false),
});

export default function EditResourcePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { slug } = params;
    
    const [isLoading, setIsLoading] = useState(true);
    const [isNew, setIsNew] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            slug: '',
            type: 'article',
            status: 'draft',
            content: '',
            mediaUrl: '',
            image: 'https://picsum.photos/seed/placeholder/1200/630',
            imageHint: 'abstract',
            description: '',
            isPremium: false,
        },
    });

    useEffect(() => {
        if (slug === 'new') {
            setIsNew(true);
            setIsLoading(false);
        } else if (typeof slug === 'string') {
            setIsNew(false);
            setIsLoading(true);
            getResourceBySlugForAdmin(slug)
                .then(resource => {
                    if (resource) {
                        form.reset(resource);
                    } else {
                        toast({ variant: "destructive", title: "Error", description: "Recurso no encontrado." });
                        router.push('/admin/content');
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [slug, form, router, toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const { success, message, slug: newSlug } = await upsertResource({
                ...values,
                createdAt: new Date().toISOString(), // This will be overwritten if updating
            });

            if (success) {
                toast({ title: "Éxito", description: message });
                router.push(`/admin/content/edit/${newSlug}`);
                router.refresh();
            } else {
                throw new Error(message);
            }

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al guardar", description: error.message });
        }
    }

    if (isLoading) {
        return (
             <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <PageHeader title={isNew ? "Crear Nuevo Recurso" : "Editar Recurso"} description="Completa el formulario para añadir o actualizar contenido educativo.">
                 <Button variant="outline" asChild>
                    <Link href="/admin/content">
                        <ChevronLeft />
                        Volver al Gestor
                    </Link>
                </Button>
            </PageHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Contenido Principal</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                     <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Título SEO</FormLabel>
                                                <FormControl><Input placeholder="Ej: Cómo Negociar Deudas con Santander en 2025" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripción Corta (para SEO y vistas previas)</FormLabel>
                                                <FormControl><Textarea placeholder="Un resumen atractivo de 1-2 frases." {...field} rows={2} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cuerpo del Contenido (Markdown)</FormLabel>
                                                <FormControl><Textarea placeholder="Escribe el artículo completo aquí. Usa Markdown para formato." {...field} rows={15} /></FormControl>
                                                <FormDescription>Puedes usar **negritas**, *itálicas*, etc.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-8">
                             <Card>
                                <CardHeader><CardTitle>Configuración</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Contenido</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="article">Artículo</SelectItem>
                                                        <SelectItem value="podcast">Podcast</SelectItem>
                                                        <SelectItem value="video">Video</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="mediaUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL de Media (Spotify, YouTube)</FormLabel>
                                                <FormControl><Input placeholder="https://open.spotify.com/..." {...field} /></FormControl>
                                                <FormDescription>Solo para podcasts o videos.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Publicación</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                     <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Borrador</SelectItem>
                                                        <SelectItem value="published">Publicado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Los borradores no son visibles para el público.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="isPremium"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Contenido Premium</FormLabel>
                                                    <FormDescription>
                                                        Solo los usuarios con plan de pago podrán verlo completo.
                                                    </FormDescription>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full" size="lg">
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </>
    )
}
