'use client';

const API_BASE = '/api/schema/collections';

export type CreateCollectionInput = {
  name: string;
  slug: string;
  icon?: string;
  metadata?: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
    options?: string[];
  }>;
};

export async function getCollections() {
  try {
    const res = await fetch(API_BASE, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function createCollection(data: CreateCollectionInput) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    let respData: any = {};
    try {
      respData = await res.json();
    } catch (e) {}
    
    if (!res.ok) {
      let errMsg = respData.error;
      if (!errMsg) {
        try {
          errMsg = await res.text();
        } catch (e) {
          errMsg = 'Erro na API';
        }
      }
      return { success: false, error: errMsg };
    }
    
    return { success: true, collection: respData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCollection(id: string) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    let respData: any = {};
    try {
      respData = await res.json();
    } catch (e) {}
    
    if (!res.ok) {
      throw new Error(respData.error || await res.text().catch(() => 'Erro na API'));
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCollectionById(id: string) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function updateCollection(id: string, data: CreateCollectionInput) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    let respData: any = {};
    try {
      respData = await res.json();
    } catch (e) {}
    
    if (!res.ok) {
      throw new Error(respData.error || await res.text().catch(() => 'Erro na API'));
    }
    
    return { success: true, collection: respData };
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return { success: false, error: error.message };
  }
}

export async function duplicateCollection(id: string) {
  try {
    const col = await getCollectionById(id);
    if (!col) return { success: false, error: 'Coleção não encontrada' };
    
    const newCat: CreateCollectionInput = {
        name: `${col.name} (Cópia)`,
        slug: `${col.slug}-copia-${Math.floor(Date.now() / 1000)}`,
        icon: col.icon || '',
        metadata: col.metadata || '',
        fields: col.fields ? col.fields.map((f: any) => ({
            name: f.name,
            label: f.label,
            type: f.type,
            required: f.required,
            order: f.order
        })) : []
    };
    
    const newCollectionRes = await createCollection(newCat);
    if (!newCollectionRes.success || !newCollectionRes.collection) {
       return newCollectionRes;
    }

    // Duplicate documents inside this collection
    try {
      const { getDocuments, createDocument } = await import('@/core/content/actions');
      const docs = await getDocuments(col.id);
      if (docs && docs.length > 0) {
        for (const doc of docs) {
           await createDocument(newCollectionRes.collection.id, newCat.slug, doc.data);
        }
      }
    } catch (e) {
      console.error('Erro ao duplicar documentos internos', e);
    }
    
    return newCollectionRes;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

