
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '../ui/use-toast';
import { addToKnowledgeBase } from '@/lib/admin-actions';
import { Loader2 } from 'lucide-react';

export function KnowledgeForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
        try {
            const result = await addToKnowledgeBase(formData);
            if (result.success) {
                toast({
                    title: 'Éxito',
                    description: result.message,
                });
                (event.target as HTMLFormElement).reset();
            } else {
                 throw new Error("La acción del servidor falló.");
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: "No se pudo agregar el conocimiento.",
            });
        }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-gray-400">Fuente / Título</label>
        <input name="source" placeholder="Ej. Constitución Art. 17" className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none" required disabled={isPending} />
      </div>
      <div>
        <label className="block text-sm mb-1 text-gray-400">Categoría</label>
        <select name="type" className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none" disabled={isPending}>
          <option value="legal">Ley / Artículo</option>
          <option value="strategy">Estrategia de Negociación</option>
          <option value="script">Script de Respuesta</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1 text-gray-400">Contenido (Lo que la IA aprenderá)</label>
        <textarea name="content" rows={8} placeholder="Escribe aquí el texto legal exacto o la instrucción..." className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none" required disabled={isPending} />
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold text-white transition-all" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 animate-spin"/> : null}
        {isPending ? 'Guardando...' : 'Guardar en Memoria Vectorial'}
      </Button>
    </form>
  );
}
