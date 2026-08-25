'use server';

import { prisma } from '@/core/db';
import { revalidatePath } from 'next/cache';
import { EXTENSION_REGISTRY } from './registry';
import { createCollection } from '@/core/schema/actions';

// Helper fictício para futuras validações de RBAC (Controle de Acesso)
async function checkPermission(permissions: string[]) {
  // Atualmente retorna true, mas no futuro você pode integrar com o sistema de sessão:
  // const user = await getCurrentUser();
  // return permissions.every(p => user.permissions.includes(p));
  return true;
}

export async function getExtensionsStatus() {
  try {
    const dbExtensions = await prisma.extension.findMany();
    const dbMap = new Map(dbExtensions.map(ext => [ext.id, ext]));

    return EXTENSION_REGISTRY.map(extDef => {
      const dbData = dbMap.get(extDef.id);
      
      // Extensões Core sempre são consideradas "instaladas" pois fazem parte do código.
      const isInstalled = extDef.type === 'core' || !!dbData;
      
      // Extensões Core são ativadas por padrão se não houver registro no banco.
      // Extensões de Schema (plugins) são desativadas por padrão.
      const isEnabled = dbData 
        ? dbData.enabled 
        : (extDef.type === 'core' ? true : false);

      return {
        ...extDef,
        isInstalled,
        isEnabled,
        installedAt: dbData?.installedAt
      };
    });
  } catch (error) {
    console.error('Error fetching extensions status:', error);
    // Fallback caso o banco esteja inacessível
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
    const extDef = EXTENSION_REGISTRY.find(e => e.id === id);
    if (!extDef) throw new Error('Extensão não encontrada no registro.');

    // Verificação de permissões RBAC no futuro
    const hasPermission = await checkPermission(extDef.type === 'core' ? ['manage:extensions'] : ['install:extensions']);
    if (!hasPermission) throw new Error('Sem permissão para instalar esta extensão.');

    const existing = await prisma.extension.findUnique({ where: { id } });
    if (existing) throw new Error('Extensão já está instalada.');

    // Se for do tipo Schema, cria as tabelas dinâmicas (SchemaCollection)
    if (extDef.type === 'schema' && extDef.schema) {
      // Verifica se já existe uma coleção com este slug por segurança
      const slugExists = await prisma.schemaCollection.findUnique({
        where: { slug: extDef.schema.slug }
      });
      
      if (!slugExists) {
        const result = await createCollection({
          name: extDef.schema.name,
          slug: extDef.schema.slug,
          icon: extDef.schema.iconName,
          fields: extDef.schema.fields
        });
        if (!result.success) {
          throw new Error('Falha ao criar o schema para a extensão: ' + result.error);
        }
      }
    }

    // Registra a extensão no banco
    await prisma.extension.create({
      data: {
        id,
        enabled: true
      }
    });

    revalidatePath('/'); // revalidate sidebar
    revalidatePath('/extensoes');
    return { success: true };
  } catch (error: any) {
    console.error('Error installing extension:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleExtension(id: string, enabled: boolean) {
  try {
    const extDef = EXTENSION_REGISTRY.find(e => e.id === id);
    if (!extDef) throw new Error('Extensão não encontrada no registro.');

    // Verificação de permissão RBAC
    const hasPermission = await checkPermission(['manage:extensions']);
    if (!hasPermission) throw new Error('Sem permissão para alterar o estado desta extensão.');

    if (!enabled && extDef.isEssential) {
      throw new Error('Extensões essenciais não podem ser desativadas.');
    }

    await prisma.extension.upsert({
      where: { id },
      update: { enabled },
      create: { id, enabled }
    });

    revalidatePath('/');
    revalidatePath('/extensoes');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling extension:', error);
    return { success: false, error: error.message };
  }
}

export async function getEnabledNavItems() {
  try {
    const dbExtensions = await prisma.extension.findMany();
    const dbMap = new Map(dbExtensions.map(e => [e.id, e.enabled]));
    
    const navItems = [];
    
    for (const ext of EXTENSION_REGISTRY) {
      const dbEnabled = dbMap.get(ext.id);
      
      // Se estiver no banco, respeita o valor. Se não, core é ativado por padrão.
      const isEnabled = dbEnabled !== undefined 
        ? dbEnabled 
        : (ext.type === 'core' ? true : false);
      
      // Verifica se o usuário tem a permissão necessária para ver o item de menu
      const hasPermission = ext.navItems 
        ? await checkPermission(ext.navItems.flatMap(n => n.requiredPermissions))
        : true;
        
      if (isEnabled && hasPermission && ext.navItems) {
        navItems.push(...ext.navItems);
      }
    }
    
    return navItems;
  } catch (error) {
    console.error('Error fetching enabled nav items:', error);
    // Em caso de erro, exibe as rotas Core por padrão (visibilidade garantida)
    return EXTENSION_REGISTRY
      .filter(ext => ext.type === 'core')
      .flatMap(ext => ext.navItems || []);
  }
}
