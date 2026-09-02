import { useAuth } from '@/components/providers/AuthProvider';

export type Role = 'admin' | 'manager' | 'it_manager' | 'auditor';

export function usePermissions() {
  const { user } = useAuth();
  const role = (user?.role as Role) || 'auditor';

  // Admin has access to everything
  const isAdmin = role === 'admin';

  return {
    role,
    isAdmin,
    // Gerente de TI e Admin podem gerenciar usuários e extensões
    canManageUsers: isAdmin || role === 'it_manager',
    canManageExtensions: isAdmin || role === 'it_manager',
    canManageSystem: isAdmin,

    // Gerente e Admin podem gerenciar conteúdo e schemas
    canManageContent: isAdmin || role === 'manager',
    canManageSchema: isAdmin || role === 'manager',

    // Auditor apenas visualiza, não pode editar/salvar
    canEdit: isAdmin || role === 'manager' || role === 'it_manager',
  };
}
