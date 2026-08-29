'use client';

import { fetchAPI } from '../api';

export interface MediaFile {
  id: string;
  name: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  dimensions: string;
  alt: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export async function getMediaFiles(params?: { search?: string; mimeType?: string; page?: number; limit?: number }) {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.mimeType) query.append('mime_type', params.mimeType);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const qs = query.toString();
    const data = await fetchAPI(`/media${qs ? '?' + qs : ''}`);
    return { data: data || [], success: true };
  } catch (error: any) {
    return { error: error.message, success: false, data: [] };
  }
}

export async function getMediaStats() {
  try {
    const data = await fetchAPI('/media/stats');
    return { data, success: true };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
}

export async function updateMediaFile(id: string, updates: { alt: string; comment: string }) {
  try {
    const data = await fetchAPI(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { data, success: true };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
}

export async function deleteMediaFile(id: string) {
  try {
    await fetchAPI(`/media/${id}`, { method: 'DELETE' });
    return { success: true };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
}
