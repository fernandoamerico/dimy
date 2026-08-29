'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCollection } from '@/core/schema/actions';
import { Folder, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProductCategoryModal({ 
  isOpen, 
  onClose,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    // Generate a slug from the name
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const metadata = JSON.stringify({
      is_product: true, // Marker for product categories
      description,
      enable_status: true,
      enable_sizes: false,
      enable_colors: false,
    });

    const res = await createCollection({
      name,
      slug,
      icon: 'Folder',
      metadata,
    });

    if (res.success) {
      toast.success('Categoria de produto criada!');
      if (onSuccess) onSuccess();
      router.push(`/produtos/categorias/builder?id=${res.id}`); // Redireciona para o builder
      onClose();
    } else {
      toast.error('Erro ao criar: ' + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            Nova Categoria
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Categoria</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Camisetas, Eletrônicos, Serviços"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição Breve</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Categoria para produtos de tecnologia"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
