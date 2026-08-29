'use client';

import { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { createCollection } from '@/core/schema/actions';
import { useRouter } from 'next/navigation';

export default function CreatePageModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    showInSidebar: false,
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Generate slug from name
    const slug = 'page-' + formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Metadata payload for a page
    const metadata = JSON.stringify({
      is_page: true,
      visibility: formData.isPublic ? 'public' : 'private',
      description: formData.description,
      show_in_sidebar: formData.showInSidebar,
    });

    try {
      const res = await createCollection({
        name: formData.name,
        slug,
        icon: 'Layout',
        metadata,
        fields: [], // Start with no fields, the builder handles it
      });

      if (res.success) {
        onClose();
        // Redirect directly to the page builder
        router.push(`/paginas/item?slug=${slug}`);
      } else {
        setError(res.error || 'Erro ao criar página.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-emerald-400" />
            Nova Página
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome (ex: Sobre Nós, Contato)
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-emerald-500/20 focus:border-blue-600 dark:focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="Digite o nome da página..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descrição Breve
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-emerald-500/20 focus:border-blue-600 dark:focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white resize-none"
              placeholder="O que haverá nesta página?"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="block text-sm font-medium text-gray-900 dark:text-white">Visibilidade Pública</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">Desative para exigir login</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="block text-sm font-medium text-gray-900 dark:text-white">Exibir no Menu Lateral</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">Adiciona um atalho no sidebar</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.showInSidebar}
                onChange={(e) => setFormData({ ...formData, showInSidebar: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-emerald-500 hover:bg-blue-700 dark:hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Página
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
