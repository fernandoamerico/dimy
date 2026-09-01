'use client';

import { validateDocumentData } from './validation';

const API_BASE = '/api/content';

export async function getCollectionBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/collections/${slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching collection by slug:', error);
    return null;
  }
}

export async function getDocuments(collectionId: string, options?: { limit?: number; page?: number }) {
  try {
    const params = new URLSearchParams();
    params.append('collectionId', collectionId);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.page) params.append('page', options.page.toString());

    const res = await fetch(`${API_BASE}/documents?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function getDocument(id: string) {
  try {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

export async function createDocument(collectionId: string, slug: string, data: any) {
  try {
    // We need to fetch collection for validation first if validation remains on client
    const collection = await getCollectionBySlug(slug);
    if (!collection) throw new Error('Coleção não encontrada.');

    const validation = validateDocumentData(collection, data);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId,
        data: validation.validData
      })
    });
    
    const contentType = res.headers.get('content-type');
    const respData = contentType && contentType.includes('application/json') ? await res.json() : {};
    
    if (!res.ok) {
      throw new Error(respData.error || await res.text().catch(() => 'Erro na API'));
    }
    
    return { success: true, id: respData.id, ...respData };
  } catch (error: any) {
    console.error('Error creating document:', error);
    return { success: false, error: error.message };
  }
}

export async function updateDocument(id: string, slug: string, data: any) {
  try {
    const collection = await getCollectionBySlug(slug);
    if (!collection) throw new Error('Coleção não encontrada.');

    const validation = validateDocumentData(collection, data);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId: collection.id,
        data: validation.validData
      })
    });
    
    const contentType = res.headers.get('content-type');
    const respData = contentType && contentType.includes('application/json') ? await res.json() : {};
    
    if (!res.ok) {
      throw new Error(respData.error || await res.text().catch(() => 'Erro na API'));
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating document:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(id: string, slug: string) {
  try {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    
    const contentType = res.headers.get('content-type');
    const respData = contentType && contentType.includes('application/json') ? await res.json() : {};
    
    if (!res.ok) {
      throw new Error(respData.error || await res.text().catch(() => 'Erro na API'));
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function duplicateDocument(id: string, collectionSlug: string) {
  try {
    const doc = await getDocument(id);
    if (!doc) return { success: false, error: 'Documento não encontrado' };

    const col = await getCollectionBySlug(collectionSlug);
    if (!col) return { success: false, error: 'Coleção não encontrada' };

    const newData = { ...doc.data };
    newData.title = `${newData.title || 'Cópia'} (Cópia)`;
    newData.slug = `${newData.slug || 'copia'}-${Math.floor(Date.now() / 1000)}`;

    return await createDocument(col.id, col.slug, newData);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

