import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './init-firebase';
import type { CommunityPost, AiAnalysis, UserPlan, CommunityPostCategory } from './types';

interface PostData {
  content: string;
  category: CommunityPostCategory;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorPlan: UserPlan | string;
}

// --- SIMULATED AI LOGIC ---
// In a real app, this would call Genkit flows.
function simulateAiModeration(content: string): Pick<AiAnalysis, 'status' | 'warningMessage'> {
    // Simulate flagging dangerous advice
    if (content.toLowerCase().includes("deja de pagar todo") || content.toLowerCase().includes("ignora al banco")) {
        return {
            status: 'flagged',
            warningMessage: 'Este consejo puede ser riesgoso. Ignorar por completo a las instituciones financieras puede llevar a acciones legales más serias. Es mejor tener una estrategia de comunicación controlada. Te recomendamos consultar a un experto.'
        }
    }
    return { status: 'safe' };
}

function simulateAiExpertAdvice(content: string, plan: UserPlan | string): string {
    const isPremium = plan !== 'Básico';

    // Simulate basic vs premium advice
    if (content.toLowerCase().includes("negociar una quita")) {
        if (isPremium) {
            return `**Estrategia Detallada para Quita:**
1.  **Inicia con Ahorro:** Asegúrate de tener al menos el 30% de la deuda disponible antes de contactar.
2.  **Primer Contacto (No Telefónico):** Envía un correo formal solicitando el estado de cuenta detallado para validar el monto. Esto demuestra seriedad.
3.  **La Primera Oferta es un Cebo:** El banco probablemente ofrecerá un 15-20% de descuento. Recházala cortésmente argumentando una "situación económica complicada".
4.  **Tu Contraoferta:** Una semana después, ofrece pagar el 35% del adeudo en una sola exhibición. Menciona que es un esfuerzo con ayuda de familiares.
5.  **Exige la Carta Convenio:** NO deposites nada hasta tener un documento formal que especifique que con ese pago, la deuda queda en ceros. Verifica que tenga el logo del banco, tu nombre completo y el saldo a pagar.`;
        } else {
            return "Para negociar una quita, es fundamental tener una cantidad ahorrada para ofrecer un pago único. Contacta al banco para explorar opciones de descuento, pero siempre exige cualquier acuerdo por escrito antes de depositar.";
        }
    }
    return "Recuerda mantener toda la comunicación por escrito y documentar cada interacción. La paciencia es clave en cualquier proceso de negociación de deuda.";
}
// --- END SIMULATED AI LOGIC ---


/**
 * Creates a new community post in Firestore after running simulated AI analysis.
 * @param postData - The data for the new post.
 * @returns The ID of the newly created post document.
 */
export async function createCommunityPost(postData: PostData): Promise<string> {
  if (!postData.authorId || !postData.content) {
    throw new Error('User ID and content are required to create a post.');
  }

  // 1. Simulate AI Moderation & Analysis
  const moderation = simulateAiModeration(postData.content);
  const expertAdvice = simulateAiExpertAdvice(postData.content, postData.authorPlan);

  const aiAnalysis: AiAnalysis = {
      ...moderation,
      expertAdvice: expertAdvice,
  };

  const postsCollectionRef = collection(db, 'community_posts');
  
  const newPost: Omit<CommunityPost, 'id' | 'createdAt'> = {
    ...(postData as Omit<PostData, 'authorPlan'> & { authorPlan: UserPlan }),
    likes: 0,
    aiAnalysis: aiAnalysis,
  };

  try {
    // 2. Save to Firestore
    const docRef = await addDoc(postsCollectionRef, {
        ...newPost,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw new Error('Could not create community post.');
  }
}

/**
 * Subscribes to community posts and listens for real-time updates.
 * @param callback - A function to be called with the array of posts whenever there's an update.
 * @returns An unsubscribe function to stop listening for updates.
 */
export function getCommunityPosts(callback: (posts: CommunityPost[]) => void) {
  const postsCollectionRef = collection(db, 'community_posts');
  const q = query(postsCollectionRef, orderBy('createdAt', 'desc'), limit(50));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const posts: CommunityPost[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as CommunityPost);
    });
    callback(posts);
  }, (error) => {
    console.error("Error fetching community posts: ", error);
    // You might want to handle this error in the UI
  });

  return unsubscribe;
}
