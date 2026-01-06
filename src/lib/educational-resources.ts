
import type { EducationalResource } from './types';

// This acts as our in-memory database for the educational resources.
// In a real application, this data would live in Firestore and be managed
// via the `upsertResource` and `deleteResource` server actions.

const THEME_IMAGES = {
  // TEMA: LEGAL / JUZGADOS / DEMANDAS (Tonos madera y gris)
  LEGAL: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',

  // TEMA: LLAMADAS / ACOSO / TELÉFONO (Tonos oscuros y tecnología)
  CALLS: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=800&auto=format&fit=crop',

  // TEMA: DINERO / AHORRO / CÁLCULOS (Tonos verdes y financieros)
  FINANCE: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop',

  // TEMA: NEGOCIACIÓN / TRATO / OFICINA (Tonos azules corporativos)
  NEGOTIATION: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop',

  // TEMA: ALERTA / PELIGRO / FRAUDE (Tonos rojos o advertencia)
  ALERT: 'https://images.unsplash.com/photo-1614064641938-3bcee529cfc4?q=80&w=800&auto=format&fit=crop',

  // TEMA: SALUD MENTAL / PAZ / CALMA (Tonos suaves y naturales)
  WELLNESS: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=800&auto=format&fit=crop',

  // TEMA: TRABAJO / RH / EMPLEO (Ambiente de oficina)
  JOB: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop',
  
  // TEMA: HERRAMIENTAS / CALCULADORAS
  TOOL: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop',

  // DEFAULT (Escritorio limpio)
  DEFAULT: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800&auto=format&fit=crop'
};

/**
 * Assigns a themed image URL based on keywords in the resource title.
 * @param title The title of the educational resource.
 * @returns An object containing the image URL and a hint for AI.
 */
function getImageForTitle(title: string, type: string): { imageUrl: string; imageHint: string } {
    const lowerTitle = title.toLowerCase();

    if (type === 'tool') {
        return { imageUrl: THEME_IMAGES.TOOL, imageHint: 'financial calculator' };
    }
    if (['demanda', 'juez', 'legal', 'profeco', 'condusef', 'ley', 'actuario', 'embargo'].some(kw => lowerTitle.includes(kw))) {
        return { imageUrl: THEME_IMAGES.LEGAL, imageHint: 'legal justice' };
    }
    if (['llamada', 'teléfono', 'whatsapp', 'celular', 'visto', 'mensaje'].some(kw => lowerTitle.includes(kw))) {
        return { imageUrl: THEME_IMAGES.CALLS, imageHint: 'communication call' };
    }
    if (['dinero', 'interés', 'buró', 'crédito', 'deuda', 'cuenta', 'finiquito', 'score', 'inversión', 'ahorro'].some(kw => lowerTitle.includes(kw))) {
        return { imageUrl: THEME_IMAGES.FINANCE, imageHint: 'finance money' };
    }
    if (['negociar', 'trato', 'acuerdo', 'carta', 'convenio'].some(kw => lowerTitle.includes(kw))) {
        return { imageUrl: THEME_IMAGES.NEGOTIATION, imageHint: 'business negotiation' };
    }
    if (['fraude', 'robo', 'montadeudas', 'cuidado', 'falso', 'identificar'].some(kw => lowerTitle.includes(kw))) {
        return { imageUrl: THEME_IMAGES.ALERT, imageHint: 'alert warning' };
    }
    if (['paz', 'calma', 'dormir', 'estrés', 'mental', 'manifiesto', 'decalogo'].some(kw => lowerTitle.includes(kw))) {
        return { imageUrl: THEME_IMAGES.WELLNESS, imageHint: 'wellness peace' };
    }
    if (['trabajo', 'rh', 'recursos humanos', 'jefe', 'empleo'].some(kw => lowerTitle.includes(kw))) {
        return { imageUrl: THEME_IMAGES.JOB, imageHint: 'office work' };
    }

    return { imageUrl: THEME_IMAGES.DEFAULT, imageHint: 'business desktop' };
}

const rawResources = [
  // --- New Financial Tools ---
  {
    id: 'tool-01',
    slug: 'auditor-gastos-hormiga',
    title: 'Auditor de Gastos Hormiga',
    type: 'tool',
    status: 'published',
    isPremium: false,
    description: 'Descubre cuánto dinero estás perdiendo en pequeños gastos diarios y cómo podrías usarlo para pagar tus deudas.',
    content: 'Calculadora para visualizar el impacto anual de pequeños gastos recurrentes.',
    createdAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'tool-02',
    slug: 'calculadora-nomina-inembargable',
    title: 'Calculadora de Nómina Inembargable',
    type: 'tool',
    status: 'published',
    isPremium: false,
    description: 'Conoce qué parte de tu sueldo está protegida por ley y no puede ser embargada por deudas civiles o mercantiles.',
    content: 'Aplica el Artículo 110 de la Ley Federal del Trabajo para determinar el monto máximo embargable de un salario.',
    createdAt: '2024-07-01T11:00:00Z',
  },
  {
    id: 'tool-03',
    slug: 'simulador-costo-oportunidad',
    title: 'Simulador de Costo de Oportunidad',
    type: 'tool',
    status: 'published',
    isPremium: false,
    description: 'Visualiza cuánto dinero podrías estar ganando si el pago de tus deudas se estuviera invirtiendo.',
    content: 'Calculadora que compara el pago de una deuda con el rendimiento de una inversión a lo largo del tiempo.',
    createdAt: '2024-07-01T12:00:00Z',
  },
  {
    id: 'tool-04',
    slug: 'calculadora-bola-nieve-avalancha',
    title: 'Calculadora Bola de Nieve vs. Avalancha',
    type: 'tool',
    status: 'published',
    isPremium: true,
    description: 'Ingresa todas tus deudas y compara cuánto tiempo y dinero ahorrarías con cada método de pago.',
    content: 'Herramienta para crear un plan de pago de deudas personalizado usando los métodos de bola de nieve o avalancha.',
    createdAt: '2024-07-01T13:00:00Z',
  },
  {
    id: 'tool-05',
    slug: 'simulador-quitas-reales',
    title: 'Simulador de Quitas Reales',
    type: 'tool',
    status: 'published',
    isPremium: true,
    description: 'Basado en datos reales, estima cuánto podrías ahorrar negociando una quita con diferentes bancos.',
    content: 'Simulador que utiliza promedios de negociación de la industria para estimar posibles acuerdos de quita.',
    createdAt: '2024-07-01T14:00:00Z',
  },
  {
    id: 'tool-06',
    slug: 'presupuesto-de-guerra',
    title: 'Plantilla de Presupuesto de Guerra',
    type: 'tool',
    status: 'published',
    isPremium: true,
    description: 'Una herramienta de planificación financiera agresiva para maximizar tu capacidad de ahorro y pago de deudas.',
    content: 'Plantilla de presupuesto detallada para optimizar ingresos y gastos y acelerar la liquidación de deudas.',
    createdAt: '2024-07-01T15:00:00Z',
  },
  // --- Existing resources from previous steps ---
  {
    id: 'rec-76',
    slug: 'mapa-reconstruccion-score-6-meses',
    title: 'Mapa de Reconstrucción de Score en 6 Meses',
    type: 'guide',
    status: 'published',
    isPremium: true,
    description: 'La fórmula matemática exacta para subir tu puntaje en Buró después de una Quita.',
    content: `...`,
    createdAt: '2024-06-28T10:00:00Z',
  },
  {
    id: 'rec-77',
    slug: 'guia-tarjetas-garantizadas',
    title: 'Guía de Tarjetas Garantizadas: Tus Opciones',
    type: 'article',
    status: 'published',
    isPremium: false,
    description: 'Las únicas tarjetas que te aprueban con mal historial y cómo usarlas.',
    content: `...`,
    createdAt: '2024-06-27T10:00:00Z',
  },
  {
    id: 'rec-78',
    slug: 'manual-lectura-buro',
    title: 'Manual de Lectura de Buró: Descifra tu Reporte',
    type: 'guide',
    status: 'published',
    isPremium: false,
    description: 'Aprende qué significan las claves MOP-01, 96, 97 y UP.',
    content: `...`,
    createdAt: '2024-06-26T10:00:00Z',
  },
  {
    id: 'rec-79',
    slug: 'estrategia-borron-y-cuenta-nueva',
    title: 'Estrategia de "Borrón y Cuenta Nueva"',
    type: 'article',
    status: 'published',
    isPremium: true,
    description: 'Los tiempos legales exactos para que se eliminen tus registros negativos.',
    content: `...`,
    createdAt: '2024-06-25T11:00:00Z',
  },
  {
    id: 'rec-80',
    slug: 'guia-inversion-nivel-cero',
    title: 'Guía de Inversión Nivel 0 (Tus primeros $100)',
    type: 'guide',
    status: 'published',
    isPremium: false,
    description: 'Qué hacer con tu primer dinero libre después de salir de deudas.',
    content: `...`,
    createdAt: '2024-06-24T12:00:00Z',
  },
  {
    id: 'rec-81',
    slug: 'manual-fondo-emergencia',
    title: 'Manual de Fondo de Emergencia',
    type: 'guide',
    status: 'published',
    isPremium: false,
    description: 'La única herramienta que garantiza que no volverás a usar la tarjeta por necesidad.',
    content: `...`,
    createdAt: '2024-06-23T13:00:00Z',
  },
  {
    id: 'rec-82',
    slug: 'guia-seguros-basicos-anti-crisis',
    title: 'Guía de Seguros Básicos Anti-Crisis',
    type: 'article',
    status: 'published',
    isPremium: false,
    description: 'Cómo protegerte para no volver a caer en deuda por accidentes.',
    content: `...`,
    createdAt: '2024-06-22T14:00:00Z',
  },
  {
    id: 'rec-83',
    slug: 'estrategia-ingresos-extra-capitalizacion',
    title: 'Estrategia de Ingresos Extra (Capitalización)',
    type: 'guide',
    status: 'published',
    isPremium: false,
    description: 'Ideas rápidas para generar capital de negociación este fin de semana.',
    content: `...`,
    createdAt: '2024-06-21T15:00:00Z',
  },
  {
    id: 'rec-85',
    slug: 'el-decalogo-del-buen-pagador',
    title: 'El Decálogo del Buen Pagador',
    type: 'article',
    status: 'published',
    isPremium: false,
    description: '10 Reglas de oro para nunca más volver a ser esclavo de los bancos.',
    content: `...`,
    createdAt: '2024-06-20T16:00:00Z',
  },
  {
    id: 'res_1',
    slug: "metodo-bola-de-nieve-vs-avalancha",
    title: "El Método Bola de Nieve vs. Avalancha",
    description: "Comprende dos de las estrategias más populares para pagar deudas y decide cuál es la mejor para ti.",
    type: 'article',
    status: 'published',
    content: `...`,
    isPremium: false,
    createdAt: '2024-05-10T10:00:00Z',
  },
  {
    id: 'res_2',
    slug: "como-crear-un-presupuesto-que-funcione",
    title: "Cómo Crear un Presupuesto que Funcione",
    description: "Aprende a rastrear tus ingresos y gastos para tomar el control de tu dinero de una vez por todas.",
    type: 'article',
    status: 'published',
    content: `...`,
    isPremium: false,
    createdAt: '2024-05-15T10:00:00Z',
  },
  {
    id: 'doc-002',
    title: 'Oficio de Revocación de Referencias',
    slug: 'oficio-revocacion-referencias',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Prohíbe legalmente al banco o despacho contactar a tus familiares y amigos.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-003',
    title: 'Guía Visual de Queja REDECO',
    slug: 'guia-queja-redeco',
    type: 'guide',
    status: 'published',
    isPremium: true,
    description: 'Paso a paso para denunciar acoso ante CONDUSEF.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-004',
    title: 'Formato de Queja PROFECO (Tiendas)',
    slug: 'formato-queja-profeco',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Usa este texto para denunciar a Coppel, Elektra o Liverpool en Concilianet.',
    content: `...`,
createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-005',
    title: 'Carta de No Reconocimiento de Deuda (Cesión)',
    slug: 'carta-no-reconocimiento-cesion',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Exige al despacho que demuestre que es el dueño legítimo antes de pagar un peso.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-006',
    title: 'Guion: Solicitud de Grabación de Llamada',
    type: 'script',
    slug: 'guion-solicitud-grabacion-llamada',
    status: 'published',
    isPremium: true,
    description: 'Lee esto cuando te digan "Usted aceptó el seguro por teléfono".',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-007',
    title: 'Carta de Cese y Desista (Trabajo)',
    slug: 'carta-cese-desista-trabajo',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Blinda tu empleo. Entrega esto si llaman a tu oficina.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-008',
    title: 'Formato de Desconocimiento de Cargos',
    slug: 'formato-desconocimiento-cargos',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Plantilla para disputar seguros o compras que no hiciste.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-009',
    title: 'Petición de Estado de Cuenta Certificado',
    slug: 'peticion-estado-de-cuenta',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Úsalo cuando te inflan la deuda y no sabes cuánto debes realmente.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-10',
    title: 'Carta Explicativa para Recursos Humanos',
    slug: 'carta-explicativa-rh',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Protege tu reputación en la oficina. Entrégala a tu jefe o RH.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-11',
    title: 'Checklist: ¿Es una Demanda Real?',
    slug: 'checklist-demanda-real',
    type: 'guide',
    status: 'published',
    isPremium: true,
    description: 'No te dejes engañar por papeles falsos pegados en tu puerta.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-12',
    title: 'Formato de Aclaración de Buró',
    slug: 'formato-aclaracion-buro',
    type: 'template',
    status: 'published',
    isPremium: true,
    description: 'Para corregir deudas que ya pagaste pero siguen apareciendo.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-13',
    title: 'Carta de Buena Voluntad (Solicitud de Espera)',
    slug: 'carta-buena-voluntad',
    type: 'template',
    status: 'published',
isPremium: true,
    description: 'Ideal si acabas de perder tu empleo y quieres evitar el conflicto legal.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'doc-15',
    title: 'Guía: Identificación de Actuarios',
    slug: 'guia-identificacion-actuarios',
    type: 'guide',
    status: 'published',
    isPremium: true,
    description: 'Aprende a distinguir a la única persona que sí puede embargarte.',
    content: `...`,
    createdAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'res_3',
    slug: "entendiendo-tu-reporte-de-credito",
    title: "Entendiendo tu Reporte de Crédito",
    description: "Descubre qué información contiene tu reporte de crédito, cómo leerlo y por qué es tan importante.",
    type: 'article',
    status: 'draft',
    content: `...`,
    isPremium: true,
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'res_4',
    slug: "tus-derechos-frente-a-los-cobradores",
    title: "Tus Derechos Frente a los Cobradores",
    description: "Conoce las leyes que te protegen del acoso y las prácticas ilegales de los despachos de cobranza.",
    type: 'article',
    status: 'published',
    content: `...`,
    isPremium: false,
    createdAt: '2024-05-25T10:00:00Z',
  },
  {
    id: 'res_5',
    slug: "podcast-negociando-con-bancos",
    title: "Podcast: Negociando con Bancos",
    description: "Episodio 1: Hablamos con un ex-gerente de banco que revela las estrategias internas para recuperar deudas.",
    type: 'podcast',
    status: 'published',
    mediaUrl: 'https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlHJf',
    content: "...",
    isPremium: true,
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'res_6',
    slug: "video-analizando-una-carta-convenio",
    title: "Video: Analizando una Carta Convenio en Vivo",
    description: "Vemos una carta convenio real, identificamos sus partes clave y te enseñamos a detectar las 'red flags' o focos rojos.",
    type: 'video',
    status: 'published',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: "...",
    isPremium: false,
    createdAt: '2024-06-05T10:00:00Z',
  },
  {
    id: 'res_31',
    slug: 'script-cese-de-contacto-whatsapp',
    title: 'Guion para Detener el Acoso por WhatsApp',
    description: 'Copia y pega este texto para exigir legalmente que un cobrador deje de contactarte por WhatsApp.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: false,
    createdAt: '2024-06-10T10:00:00Z'
  },
  {
    id: 'res_32',
    slug: 'script-negociar-quita-tc',
    title: 'Guion Maestro para Negociar una Quita en Tarjeta de Crédito',
    description: 'La secuencia exacta de 3 pasos para contactar al banco y obtener el máximo descuento posible en tu tarjeta.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-11T10:00:00Z'
  },
  {
    id: 'res_33',
    slug: 'script-disputa-cargo-no-reconocido',
    title: 'Guion para Disputar un Cargo No Reconocido',
    description: 'El texto exacto para presentar una reclamación efectiva ante el banco por un cargo que no realizaste.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-12T10:00:00Z'
  },
  {
    id: 'res_34',
    slug: 'script-solicitud-carta-convenio',
    title: 'Guion para Exigir tu Carta Convenio',
    description: 'Nunca pagues un acuerdo de palabra. Usa este guion para exigir el documento legal que te protege.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: false,
    createdAt: '2024-06-13T10:00:00Z'
  },
  {
    id: 'res_35',
    slug: 'script-detener-llamadas-a-terceros',
    title: 'Guion para Prohibir Llamadas a Familiares y Trabajo',
    description: 'La ley te protege. Usa este texto para detener las llamadas a personas que no son tú.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: false,
    createdAt: '2024-06-14T10:00:00Z'
  },
  {
    id: 'res_36',
    slug: 'script-negociar-reestructura',
    title: 'Guion para Negociar una Reestructura de Pagos',
    description: 'Si no puedes liquidar, aprende a negociar pagos mensuales más bajos sin afectar tanto tu crédito.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-15T10:00:00Z'
  },
  {
    id: 'res_37',
    slug: 'script-respuesta-amenaza-embargo',
    title: 'Guion de Respuesta ante Amenaza de Embargo',
    description: 'Mantén la calma y responde con inteligencia. Este guion desarma la táctica de miedo más común.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-16T10:00:00Z'
  },
  {
    id: 'res_38',
    slug: 'script-solicitud-estado-cuenta',
    title: 'Guion para Solicitar Estado de Cuenta Detallado',
    description: 'Valida cada peso y centavo. Usa este texto para solicitar un desglose completo de tu deuda.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: false,
    createdAt: '2024-06-17T10:00:00Z'
  },
  {
    id: 'res_39',
    slug: 'script-respuesta-acoso-sms',
    title: 'Guion para Frenar el Acoso por Mensajes de Texto',
    description: 'Copia y pega esta respuesta para detener el bombardeo de SMS de cobranza a tu celular.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: false,
    createdAt: '2024-06-18T10:00:00Z'
  },
  {
    id: 'res_40',
    slug: 'script-negociar-deuda-castigada',
    title: 'Guion para Negociar una Deuda Ya Castigada (Vendida)',
    description: 'Negociar con un despacho que compró tu deuda es diferente. Usa esta estrategia para ganar.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-19T10:00:00Z'
  },
  {
    id: 'res_41',
    slug: 'script-post-pago-exigir-carta-finiquito',
    title: 'Guion Post-Pago para Exigir tu Carta Finiquito',
    description: 'Pagaste el convenio, ¿y ahora qué? Usa este guion para asegurarte de que te den tu carta de no adeudo.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-20T10:00:00Z'
  },
  {
    id: 'res_42',
    slug: 'script-respuesta-visita-domicilio',
    title: 'Guion para Atender una Visita de Cobranza en tu Domicilio',
    description: 'No te intimides. Aprende qué decir (y qué no) si un cobrador toca a tu puerta.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: false,
    createdAt: '2024-06-21T10:00:00Z'
  },
  {
    id: 'res_43',
    slug: 'script-iniciar-queja-condusef-redeco',
    title: 'Guion para Iniciar Queja en REDECO (CONDUSEF)',
    description: 'Borrador de texto listo para copiar y pegar en el portal de CONDUSEF por acoso y malas prácticas.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-22T10:00:00Z'
  },
  {
    id: 'res_44',
    slug: 'script-negociar-deuda-automotriz',
    title: 'Guion para Negociar Deuda de Crédito Automotriz',
    description: 'Estrategia de 3 pasos para negociar el adeudo de tu auto y evitar que te quiten la unidad.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: true,
    createdAt: '2024-06-23T10:00:00Z'
  },
  {
    id: 'res_45',
    slug: 'script-respuesta-generica-no-confirmar-datos',
    title: 'Guion Universal de "No Confirmación de Datos"',
    description: 'La regla de oro: nunca confirmes datos por teléfono. Usa este guion universal para protegerte.',
    type: 'script',
    status: 'published',
    content: '...',
    isPremium: false,
    createdAt: '2024-06-24T10:00:00Z'
  }
].map(doc => {
    // Mantener la propiedad isPremium del documento original.
    // El campo `requiresLeadGen` no está en el tipo `EducationalResource`, así que se omite.
    const { isPremium, ...restOfDoc } = doc;
    const { imageUrl, imageHint } = getImageForTitle(doc.title, doc.type);
    
    return {
        ...restOfDoc,
        content: (restOfDoc.content || '').trim(), // Ensure content is trimmed
        isPremium: isPremium, // Asegurarse de que el valor de isPremium se mantenga
        image: imageUrl,
        imageHint: imageHint,
    };
});

// Remove duplicates and combine
const existingIds = new Set(rawResources.map(r => r.id));
const allResources = [...rawResources];
allResources.forEach(r => {
    if (!existingIds.has(r.id)) {
        allResources.push(r);
        existingIds.add(r.id);
    }
});


export const educationalResources: EducationalResource[] = allResources;
