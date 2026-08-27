'use client';

import { EXTENSION_REGISTRY } from './registry';

// Since this is statically exported, we must use fetch to the API
const API_BASE = '/api';

export async function getExtensionsStatus() {
  try {
    const res = await fetch(`${API_BASE}/extensions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch extensions from API');
    }

    const contentType = res.headers.get('content-type');
    let dbExtensions = contentType && contentType.includes('application/json') ? await res.json() : [];
    if (!dbExtensions) dbExtensions = [];
    const dbMap = new Map(dbExtensions.map((ext: any) => [ext.id, ext]));

    return EXTENSION_REGISTRY.map(extDef => {
      const dbData: any = dbMap.get(extDef.id);
      
      const isInstalled = extDef.type === 'core' || !!dbData;
      
      const isEnabled = dbData 
        ? dbData.enabled 
        : (extDef.type === 'core' ? true : false);

      return {
        ...extDef,
        isInstalled,
        isEnabled,
        installedAt: dbData?.installed_at || dbData?.installedAt
      };
    });
  } catch (error) {
    console.error('Error fetching extensions status:', error);
    return EXTENSION_REGISTRY.map(extDef => ({
      ...extDef,
      isInstalled: extDef.type === 'core',
      isEnabled: extDef.type === 'core',
      installedAt: undefined
    }));
  }
}

export async function installExtension(id: string) {
  try {
    const res = await fetch(`${API_BASE}/extensions/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });

    const contentType = res.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') ? await res.json() : {};
    if (!res.ok) {
      const errorMsg = data.error || await res.text().catch(() => 'Erro na API');
      throw new Error(errorMsg);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error installing extension:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleExtension(id: string, enabled: boolean) {
  try {
    const res = await fetch(`${API_BASE}/extensions/toggle/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled })
    });

    const contentType = res.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') ? await res.json() : {};
    if (!res.ok) {
      const errorMsg = data.error || await res.text().catch(() => 'Erro na API');
      throw new Error(errorMsg);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling extension:', error);
    return { success: false, error: error.message };
  }
}

export async function uninstallExtension(id: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/extensions/uninstall/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    const contentType = res.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') ? await res.json() : {};
    if (!res.ok) {
      const errorMsg = data.error || await res.text().catch(() => 'Erro na API');
      throw new Error(errorMsg);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error uninstalling extension:', error);
    return { success: false, error: error.message };
  }
}

export async function getEnabledNavItems() {
  try {
    const res = await fetch(`${API_BASE}/extensions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) throw new Error('API failed');
    const contentType = res.headers.get('content-type');
    let dbExtensions = contentType && contentType.includes('application/json') ? await res.json() : [];
    if (!dbExtensions) dbExtensions = [];
    const dbMap = new Map(dbExtensions.map((e: any) => [e.id, e.enabled]));
    
    const navItems = [];
    
    for (const ext of EXTENSION_REGISTRY) {
      const dbEnabled = dbMap.get(ext.id);
      
      const isEnabled = dbEnabled !== undefined 
        ? dbEnabled 
        : (ext.type === 'core' ? true : false);
      
      if (isEnabled && ext.navItems) {
        navItems.push(...ext.navItems);
      }
    }
    
    return navItems;
  } catch (error) {
    console.error('Error fetching enabled nav items:', error);
    return EXTENSION_REGISTRY
      .filter((ext: any) => ext.type === 'core')
      .flatMap((ext: any) => ext.navItems || []);
  }
}

export async function getSidebarOrder() {
  try {
    const res = await fetch(`${API_BASE}/system/config?key=sidebar_order`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
        const config = await res.json();
        if (config && config.value) {
            return JSON.parse(config.value);
        }
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function saveSidebarOrder(order: string[]) {
  try {
    const res = await fetch(`${API_BASE}/system/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'sidebar_order',
        value: JSON.stringify(order)
      })
    });
    
    if (res.ok) {
      return { success: true };
    }
    return { success: false, error: 'Falha ao salvar ordem' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
