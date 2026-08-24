'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

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
