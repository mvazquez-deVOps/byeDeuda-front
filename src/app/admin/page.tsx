
import { getKnowledgeBaseDocs } from '@/lib/admin-actions';
import { Loader2 } from 'lucide-react';
import { KnowledgeForm } from '@/components/admin/knowledge-form';

// Esta página ahora es un Componente de Servidor de React.
// No usa 'use client' y puede obtener datos directamente.

async function KnowledgeHistory() {
    const docs = await getKnowledgeBaseDocs();

    if (!docs || docs.length === 0) {
        return <p className="text-gray-500 italic">La base de conocimiento está vacía.</p>;
    }
    
    return (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {docs.map((doc: any) => (
                <div key={doc.id} className="p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold bg-blue-900/50 text-blue-200 px-2 py-1 rounded uppercase tracking-wider">{doc.metadata.type}</span>
                        <span className="text-xs text-gray-500">{doc.metadata.source}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{doc.content}</p>
                </div>
            ))}
        </div>
    );
}

export default function KnowledgePage() {
  return (
    <div className="p-8 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-white">🧠 Cerebro Legal (RAG)</h1>
           <p className="text-gray-400">Entrena a tu IA con leyes y estrategias de negociación.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO (Componente de Cliente) */}
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Inyectar Conocimiento</h2>
          <KnowledgeForm />
        </div>

        {/* COLUMNA DERECHA: HISTORIAL (Renderizado en el Servidor) */}
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Memoria Actual</h2>
          {/* @ts-ignore // Next.js 13+ RSC support for async components */}
          <KnowledgeHistory />
        </div>
      </div>
    </div>
  );
}
