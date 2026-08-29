'use client';

import { useEffect, useState } from 'react';
import { getCollections } from '@/core/schema/actions';
import { Tags, Plus, Layers, Folder, Search, ArrowLeft } from 'lucide-react';
import CreateProductCategoryModal from '@/components/produtos/CreateProductCategoryModal';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const allCollections = await getCollections();
      
      // Filter only collections that have is_product in their metadata
      const productCategories = allCollections.filter(col => {
        if (!col.metadata) return false;
        try {
          const meta = JSON.parse(col.metadata);
          return meta.is_product === true;
        } catch (e) {
          return false;
        }
      });
      
      setCategories(productCategories);
    } catch (error) {
      console.error("Failed to fetch product categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-emerald-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/produtos" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Tags className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
                Categorias de Produtos
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gerencie os modelos e blocos para cada tipo de produto.
              </p>
            </div>
          </div>
          
          {categories.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Layers className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhuma categoria de produto
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Você precisa criar pelo menos uma categoria (ex: Camisetas, Eletrônicos) para poder cadastrar produtos nela.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              <Plus className="w-5 h-5" />
              Criar Categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              let meta = { description: '' };
              try {
                if (cat.metadata) meta = { ...meta, ...JSON.parse(cat.metadata) };
              } catch (e) {}

              return (
                <div key={cat.id} className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 hover:shadow-md hover:border-blue-200 dark:hover:border-emerald-500/30 transition-all overflow-hidden">
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-emerald-400 group-hover:bg-blue-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                        <Folder className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-blue-200 dark:border-emerald-900/50">
                        {cat.fields?.length || 0} Blocos
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {meta.description || 'Sem descrição.'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 flex justify-end gap-3">
                    <Link 
                      href={`/produtos/categorias/builder?id=${cat.id}`}
                      className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:text-blue-700 dark:hover:text-emerald-300 flex items-center gap-1"
                    >
                      Editar Skeleton
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreateProductCategoryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchCategories} 
        />
      </div>
    </DashboardLayout>
  );
}
