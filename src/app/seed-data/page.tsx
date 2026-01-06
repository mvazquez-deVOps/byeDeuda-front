import { indexDocument } from '@/lib/knowledge-base';
import { redirect } from 'next/navigation';

export default function SeedDataPage() {
  
  // Esta función se ejecuta en el servidor cuando le das al botón
  async function seedAction() {
    'use server';
    
    console.log("🌱 Sembrando conocimiento legal...");

    // Dato 1: Cárcel por deudas
    await indexDocument(
      "En México, el artículo 17 de la Constitución establece que 'nadie puede ser aprisionado por deudas de carácter puramente civil'. Esto significa que los despachos de cobranza no pueden amenazarte con cárcel por deberle al banco o a una tienda departamental.",
      "Constitución Política de los Estados Unidos Mexicanos - Art. 17",
      "ley"
    );

    // Dato 2: Embargos
    await indexDocument(
      "Un embargo precautorio SOLO puede ser ejecutado si existe una orden dictada por un juez tras un juicio mercantil. Un cobrador o abogado NO puede llegar a tu casa a llevarse cosas sin esa orden judicial y sin la presencia de un actuario identificado.",
      "Código de Comercio - Procesos Mercantiles",
      "ley"
    );

    // Dato 3: Acoso telefónico
    await indexDocument(
      "La cobranza extrajudicial ilegal es un delito (Art 284 Bis Código Penal). Está prohibido llamar en horarios inhábiles, usar groserías, amenazas, o hacerse pasar por autoridades judiciales. Si hacen esto, puedes denunciar ante la CONDUSEF o la FGR.",
      "Código Penal Federal - Art. 284 Bis",
      "ley"
    );

    console.log("✅ Conocimiento sembrado con éxito.");
    redirect('/dashboard/legal-assistant'); // Te manda al chat para probar
  }

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Alimentar Cerebro Legal 🧠</h1>
      <p className="mb-8 text-gray-400">Haz clic para inyectar las leyes básicas de defensa a la base de datos.</p>
      
      <form action={seedAction}>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105"
        >
          INJECTAR DATOS LEGALES AHORA
        </button>
      </form>
    </div>
  );
}