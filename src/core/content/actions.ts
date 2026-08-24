'use server';

import { prisma } from '@/core/db';
import { revalidatePath } from 'next/cache';

export async function getCollectionBySlug(slug: string) {
  return await prisma.schemaCollection.findUnique({
    where: { slug },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  });
}

export async function getDocuments(collectionId: string, options?: { limit?: number; page?: number }) {
  const skip = options?.page && options?.limit ? (options.page - 1) * options.limit : undefined;
  const take = options?.limit;

  const docs = await prisma.document.findMany({
    where: { collectionId },
    orderBy: { createdAt: 'desc' },
    ...(skip !== undefined ? { skip } : {}),
    ...(take !== undefined ? { take } : {}),
  });
  
  return docs.map((doc: any) => ({
    id: doc.id,
    collectionId: doc.collectionId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    data: JSON.parse(doc.data)
  }));
}

export async function getDocument(id: string) {
  const doc = await prisma.document.findUnique({
    where: { id }
  });
  if (!doc) return null;
  
  return {
    ...doc,
    data: JSON.parse(doc.data)
  };
}

export async function createDocument(collectionId: string, slug: string, data: any) {
  try {
    await prisma.document.create({
      data: {
        collectionId,
        data: JSON.stringify(data)
      }
    });
    revalidatePath(`/content/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDocument(id: string, slug: string, data: any) {
  try {
    await prisma.document.update({
      where: { id },
      data: {
        data: JSON.stringify(data)
      }
    });
    revalidatePath(`/content/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(id: string, slug: string) {
  try {
    await prisma.document.delete({
      where: { id }
    });
    revalidatePath(`/content/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
