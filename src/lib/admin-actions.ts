
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { adminAuth, adminDb } from './admin-firebase';
import type { User, UserRole, EducationalResource } from './types';
import { indexDocument } from '@/lib/knowledge-base';
import { upsertResource as dbUpsertResource, deleteResource as dbDeleteResource } from '@/lib/resources';

// --- SEGURIDAD ---

async function verifySuperAdmin(): Promise<string> {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) {
        throw new Error('Permiso denegado: No se detecta sesión de administrador válida.');
    }
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        if (decodedClaims.role !== 'superadmin') {
            throw new Error('Permiso denegado: Se requiere rol de superadministrador.');
        }
        return decodedClaims.uid;
    } catch (error) {
        throw new Error('Permiso denegado: La sesión de administrador no es válida o ha expirado.');
    }
}

// --- GESTIÓN DE USUARIOS ---

export async function getUsersWithFinancials(): Promise<User[]> {
    await verifySuperAdmin(); 

    try {
        const usersSnapshot = await adminDb.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));

        const debtsSnapshot = await adminDb.collectionGroup('debts').get();
        const debtsByUser = new Map<string, any[]>();

        debtsSnapshot.forEach(doc => {
            const debt = doc.data();
            const userId = doc.ref.parent.parent?.id;
            if (userId) {
                if (!debtsByUser.has(userId)) {
                    debtsByUser.set(userId, []);
                }
                debtsByUser.get(userId)!.push(debt);
            }
        });
        
        const usersWithFinancials = users.map(user => {
            const userDebts = debtsByUser.get(user.uid) || [];
            const totalDebt = userDebts.reduce((acc, debt) => acc + debt.amount, 0);
            const debtCount = userDebts.length;
            return {
                ...user,
                totalDebt,
                debtCount,
            };
        });

        return usersWithFinancials;
    } catch (error: any) {
        console.error('Error fetching users with financials:', error);
        throw new Error(`Failed to fetch user data: ${error.message}`);
    }
}

export async function forceSuperAdminRole(email: string): Promise<{ success: boolean; message: string }> {
     await verifySuperAdmin();
     try {
        const userRecord = await adminAuth.getUserByEmail(email);
        const currentClaims = userRecord.customClaims || {};
        await adminAuth.setCustomUserClaims(userRecord.uid, { ...currentClaims, role: 'superadmin' });
        await adminDb.doc(`users/${userRecord.uid}`).update({ role: 'superadmin' });
        return { success: true, message: `El rol de ${email} ha sido actualizado a superadmin.` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function adminUpdateUser(uid: string, data: { name: string, role: UserRole, plan: string }): Promise<{ success: boolean; message: string }> {
    await verifySuperAdmin();
    try {
        await adminAuth.setCustomUserClaims(uid, { role: data.role, plan: data.plan });
        await adminDb.doc(`users/${uid}`).update({
            name: data.name,
            role: data.role,
            plan: data.plan
        });
        revalidatePath('/admin');
        return { success: true, message: 'Usuario actualizado correctamente.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function createUser(formData: FormData): Promise<{ success: boolean, error?: string, uid?: string }> {
  await verifySuperAdmin();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as UserRole;
  const plan = formData.get('plan') as string;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role, plan });
    
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      role,
      plan,
      createdAt: new Date().toISOString(),
    });
    
    revalidatePath('/admin');
    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error(`Error creating user: ${error}`);
    return { success: false, error: error.message };
  }
}

// --- CEREBRO IA (KNOWLEDGE BASE) ---

export async function getKnowledgeBaseDocs() {
    await verifySuperAdmin();
    try {
        const snapshot = await adminDb.collection('knowledge_base').orderBy('createdAt', 'desc').limit(20).get();
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return JSON.parse(JSON.stringify(docs)); // Serialize data for client
    } catch (error) {
        console.error("Error fetching knowledge base:", error);
        return [];
    }
}


export async function addToKnowledgeBase(formData: FormData) {
    'use server';
    await verifySuperAdmin(); 

    const content = formData.get('content') as string;
    const source = formData.get('source') as string;
    const type = formData.get('type') as string || 'legal';

    if (!content || !source) {
        throw new Error("El contenido y la fuente son obligatorios.");
    }

    const result = await indexDocument(content, source, type);
    
    if (!result.success) throw new Error("Error al indexar en la IA.");
    
    revalidatePath('/admin');
    return { success: true, message: "Conocimiento agregado al cerebro de la IA." };
}


// --- GESTOR DE CONTENIDO (EDUCATIONAL RESOURCES) ---
export async function getAllResourcesForAdmin(): Promise<EducationalResource[]> {
    await verifySuperAdmin();
    const snapshot = await adminDb.collection('educational_resources').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EducationalResource));
}

export async function getResourceBySlugForAdmin(slug: string): Promise<EducationalResource | null> {
    await verifySuperAdmin();
    const snapshot = await adminDb.collection('educational_resources').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as EducationalResource;
}


export async function upsertResource(data: EducationalResource): Promise<{ success: boolean; message: string; slug: string }> {
    await verifySuperAdmin();
    try {
        const { slug } = await dbUpsertResource(data);
        revalidatePath('/admin/content');
        revalidatePath(`/admin/content/edit/${slug}`);
        revalidatePath(`/resources/${slug}`);
        revalidatePath('/resources');
        return { success: true, message: 'Recurso guardado con éxito.', slug };
    } catch (error: any) {
        return { success: false, message: error.message, slug: data.slug || 'new' };
    }
}

export async function deleteResource(id: string): Promise<{ success: boolean; message: string }> {
    await verifySuperAdmin();
    try {
        await dbDeleteResource(id);
        revalidatePath('/admin/content');
        revalidatePath('/resources');
        return { success: true, message: 'Recurso eliminado.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
