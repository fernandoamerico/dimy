'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Images, Loader2 } from 'lucide-react';
import { createCollection } from '@/core/schema/actions';
import { useRouter } from 'next/navigation';

export default function CreateCarouselModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const slug = 'banner-' + formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const metadata = JSON.stringify({
      is_banner: true,
      description: formData.description,
    });

    const fields = [
      { name: 'title', label: 'Título do Slide', type: 'text', required: true, order: 0 },
      { name: 'subtitle', label: 'Subtítulo', type: 'text', required: false, order: 1 },
      { name: 'imageUrl', label: 'Imagem (Desktop)', type: 'image', required: true, order: 2 },
      { name: 'mobileImageUrl', label: 'Imagem (Mobile)', type: 'image', required: false, order: 3 },
      { name: 'buttonText', label: 'Texto do Botão', type: 'text', required: false, order: 4 },
      { name: 'buttonUrl', label: 'Link do Botão', type: 'text', required: false, order: 5 },
      { name: 'order', label: 'Ordem (1, 2, 3...)', type: 'number', required: true, order: 6 },
      { name: 'active', label: 'Ativo', type: 'boolean', required: true, order: 7 },
    ];

    try {
      const res = await createCollection({
        name: formData.name,
        slug,
        icon: 'Images',
        metadata,
        fields,
      });

      if (res.success) {
        onSuccess();
        onClose();
        router.refresh();
      } else {
        setError(res.error || 'Erro ao criar carrossel.');
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
            <Images className="w-5 h-5 text-blue-600 dark:text-emerald-400" />
            Novo Carrossel
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
              Nome (ex: Home Hero, Parceiros)
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-emerald-500/20 focus:border-blue-600 dark:focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="Digite o nome do carrossel..."
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
              placeholder="Onde este carrossel será exibido?"
            />
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
              Criar Carrossel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
