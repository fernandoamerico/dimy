// src/core/api.ts
// Unified HTTP client to replace Next.js Server Actions

const API_BASE = '/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include credentials for cookies (session auth)
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', 
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch (e) {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return null;

  return JSON.parse(text);
}

// Equivalent of previous setupAdmin server action
export async function setupAdmin(data: any) {
  try {
    const res = await fetchAPI('/auth/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: res };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Equivalent of previous login server action
export async function login(data: any) {
  try {
    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: res };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Equivalent of previous logout server action
export async function logout() {
  try {
    await fetchAPI('/auth/logout', { method: 'POST' });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export const apiKeysService = {
  list: () => fetchAPI('/system/api-keys'),
  create: (name: string) => fetchAPI('/system/api-keys', { 
    method: 'POST', 
    body: JSON.stringify({ name }) 
  }),
  delete: (id: string) => fetchAPI(`/system/api-keys/${id}`, { method: 'DELETE' }),
};
