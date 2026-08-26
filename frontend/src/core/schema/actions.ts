'use server';

import { prisma } from '@/core/db';
import { revalidatePath } from 'next/cache';

export type CreateCollectionInput = {
  name: string;
  slug: string;
  icon?: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
  }>;
};

export async function getCollections() {
  return await prisma.schemaCollection.findMany({
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createCollection(data: CreateCollectionInput) {
  try {
    const newCollection = await prisma.schemaCollection.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || null,
        fields: {
          create: data.fields.map(f => ({
            name: f.name,
            label: f.label,
            type: f.type,
            required: f.required,
            order: f.order
          }))
        }
      },
    });
    
    revalidatePath('/'); // revalidate sidebar and routes
    return { success: true, collection: newCollection };
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCollection(id: string) {
  try {
    await prisma.schemaCollection.delete({
      where: { id }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCollectionById(id: string) {
  return await prisma.schemaCollection.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  });
}

export async function updateCollection(id: string, data: CreateCollectionInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the collection itself
      const updatedCollection = await tx.schemaCollection.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          icon: data.icon || null,
        }
      });

      // 2. Delete all existing fields of this collection
      await tx.schemaField.deleteMany({
        where: { collectionId: id }
      });

      // 3. Create the new fields
      if (data.fields && data.fields.length > 0) {
        await tx.schemaField.createMany({
          data: data.fields.map((f) => ({
            name: f.name,
            label: f.label,
            type: f.type,
            required: f.required,
            order: f.order,
            collectionId: id,
          })),
        });
      }

      return updatedCollection;
    });

    revalidatePath('/'); // revalidate sidebar and routes
    revalidatePath('/schema');
    return { success: true, collection: result };
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return { success: false, error: error.message };
  }
}
