'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, Plus, Edit2, Trash2, X, ShieldAlert } from 'lucide-react';
import { usePermissions } from '@/core/hooks/usePermissions';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

const roleMap: Record<string, { label: string; color: string }> = {
  admin: { label: 'Administrador', color: 'bg-red-50 text-red-600 border-red-200' },
  manager: { label: 'Gerente', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  it_manager: { label: 'Gerente de TI', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  auditor: { label: 'Auditor', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

export default function EquipePage() {
  const { canManageUsers, role: currentUserRole } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'auditor' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'auditor' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Erro ao salvar usuário');
      }

      await fetchUsers();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Erro ao excluir');
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
            Gestão de Equipe
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">Gerencie os membros da equipe e atribua permissões de acesso ao CMS.</p>
        </div>

        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-slate-200/50 dark:border-neutral-800 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Membros da Equipe</h2>
            {canManageUsers && (
              <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-emerald-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Convidar Membro
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando usuários...</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {users.map(user => {
                const roleInfo = roleMap[user.role] || roleMap['auditor'];
                const isSystemAdmin = user.role === 'admin';
                const canEditThisUser = canManageUsers && (currentUserRole === 'admin' || !isSystemAdmin);

                return (
                  <div key={user.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${roleInfo.color}`}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{user.name}</h3>
                        <p className="text-gray-500 dark:text-neutral-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                      
                      {canEditThisUser && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openModal(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-emerald-400 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-neutral-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Senha {editingUser && <span className="text-slate-400 font-normal">(deixe em branco para não alterar)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Cargo</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                >
                  <option value="auditor">Auditor (Apenas visualizar)</option>
                  <option value="manager">Gerente (Conteúdo e Estrutura)</option>
                  <option value="it_manager">Gerente de TI (Apps e Equipe)</option>
                  {currentUserRole === 'admin' && (
                    <option value="admin">Administrador (Acesso Total)</option>
                  )}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-neutral-400 font-medium hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 dark:bg-emerald-600 text-white font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
