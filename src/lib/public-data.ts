'use server';

// Datos simulados para que la web arranque
const educationalResources = [
  {
    id: '1',
    title: 'Guía para salir de deudas',
    description: 'Aprende los pasos básicos para recuperar tu libertad financiera.',
    slug: 'guia-salir-deudas',
    type: 'guide',
    content: 'Contenido...',
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Calculadora de Intereses',
    description: 'Herramienta para calcular tus pagos.',
    slug: 'calculadora-intereses',
    type: 'tool',
    content: 'Contenido...',
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function getPublicResources() {
  return JSON.parse(JSON.stringify(educationalResources));
}

export async function getPublicResourceBySlug(slug: string) {
  const resource = educationalResources.find((r) => r.slug === slug);
  return resource ? JSON.parse(JSON.stringify(resource)) : null;
}