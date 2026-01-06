
'use server';

import { adminDb } from './admin-firebase';
import type { EducationalResource } from './types';

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}


export async function upsertResource(data: EducationalResource): Promise<{ slug: string }> {
    const { id, ...resourceData } = data;
    
    // Generate slug from title if it's a new resource or slug is empty
    if (!resourceData.slug) {
        resourceData.slug = generateSlug(resourceData.title);
    }
    
    // Ensure there are no undefined values that Firestore can't handle
    const cleanedData = Object.fromEntries(
        Object.entries(resourceData).filter(([_, v]) => v !== undefined)
    );

    if (id) {
        // Update existing resource
        const resourceRef = adminDb.collection('educational_resources').doc(id);
        await resourceRef.update({
            ...cleanedData,
            updatedAt: new Date().toISOString(),
        });
        return { slug: resourceData.slug };
    } else {
        // Create new resource
        const resourceRef = adminDb.collection('educational_resources').doc();
        await resourceRef.set({
            ...cleanedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        return { slug: resourceData.slug };
    }
}

export async function deleteResource(id: string): Promise<void> {
    const resourceRef = adminDb.collection('educational_resources').doc(id);
    await resourceRef.delete();
}
