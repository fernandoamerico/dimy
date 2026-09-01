'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Loader2, Settings } from 'lucide-react';
import { updateCollection } from '@/core/schema/actions';
import { useRouter } from 'next/navigation';

export default function EditPageModal({
  isOpen,
  onClose,
  page,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  page: any;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isPublic: true,
    showInSidebar: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (page && isOpen) {
      let meta = { description: '', visibility: 'public', show_in_sidebar: false };
      try {
        if (page.metadata) meta = { ...meta, ...JSON.parse(page.metadata) };
      } catch (e) {}

      setFormData({
        name: page.name || '',
        slug: page.slug || '',
        description: meta.description || '',
        isPublic: meta.visibility !== 'private',
        showInSidebar: meta.show_in_sidebar || false,
      });
    }
  }, [page, isOpen]);

  if (!isOpen || !page) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let meta = {};
    try {
      if (page.metadata) meta = JSON.parse(page.metadata);
    } catch (e) {}

    const updatedMetadata = JSON.stringify({
      ...meta,
      is_page: true,
      visibility: formData.isPublic ? 'public' : 'private',
      description: formData.description,
      show_in_sidebar: formData.showInSidebar,
    });

    try {
      const res = await updateCollection(page.id, {
        name: formData.name,
        slug: formData.slug,
        icon: page.icon || 'Layout',
        metadata: updatedMetadata,
        fields: page.fields || [],
      });

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Erro ao atualizar página.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-emerald-400" />
            Configurações da Página
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
              Nome da Página
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-emerald-500/20 focus:border-blue-600 dark:focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug (URL)
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => {
                const formatted = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\-]+/g, '-');
                setFormData({ ...formData, slug: formatted });
              }}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-emerald-500/20 focus:border-blue-600 dark:focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white font-mono text-sm"
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
              disabled={loading || !formData.name || !formData.slug}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-emerald-500 hover:bg-blue-700 dark:hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
