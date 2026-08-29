'use client';

import { useEffect, useState } from 'react';
import { getCollections, duplicateCollection } from '@/core/schema/actions';
import { getDocuments } from '@/core/content/actions';
import { FileText, Plus, Package, Folder, Search, Trash2, LayoutGrid, List, Copy } from 'lucide-react';
import CreateProductCategoryModal from '@/components/produtos/CreateProductCategoryModal';
import { DeleteCategoryModal } from '@/components/publications/DeleteCategoryModal';
import Link from 'next/link';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';

export default function ProductsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDuplicating(id);
    const toastId = toast.loading('Duplicando categoria...');
    
    try {
      const res = await duplicateCollection(id);
      if (res.success) {
        toast.success('Categoria duplicada com sucesso!', { id: toastId });
        fetchCategories();
      } else {
        toast.error('Erro ao duplicar: ' + res.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Erro de conexão ao duplicar.', { id: toastId });
    } finally {
      setIsDuplicating(null);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const allCollections = await getCollections();
      
      const pubCollections = allCollections.filter((col: any) => {
        if (!col.metadata) return false;
        try {
          const meta = JSON.parse(col.metadata);
          return meta.is_product === true;
        } catch (e) {
          return false;
        }
      });
      
      setCategories(pubCollections);
      
      // Fetch post counts quietly
      const counts: Record<string, number> = {};
      await Promise.all(pubCollections.map(async (cat: any) => {
        try {
          const docs = await getDocuments(cat.id);
          counts[cat.id] = docs.length;
        } catch (e) {
          counts[cat.id] = 0;
        }
      }));
      setPostCounts(counts);

    } catch (error) {
      console.error("Failed to fetch publications", error);
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
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
              Produtos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gerencie as categorias dos seus produtos no catálogo.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                title="Visualização em Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhuma categoria de produtos encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Você ainda não criou nenhuma categoria para os seus produtos. Crie sua primeira categoria para começar a cadastrar.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Categoria
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              let meta = { visibility: 'public', description: '' };
              try {
                if (cat.metadata) meta = { ...meta, ...JSON.parse(cat.metadata) };
              } catch (e) {}

              const count = postCounts[cat.id] ?? '...';

              return (
                <div key={cat.id} className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 dark:shadow-sm dark:hover:shadow-md hover:border-blue-200 dark:hover:border-emerald-500/30 transition-all overflow-hidden relative">
                  <Link href={`/produtos/lista?slug=${cat.slug}`} className="p-5 flex-1 block">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-emerald-400 group-hover:bg-blue-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        meta.visibility === 'public' 
                          ? 'bg-green-50 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-green-200 dark:border-emerald-900/50'
                          : 'bg-orange-50 text-orange-700 dark:bg-amber-500/10 dark:text-amber-400 border border-orange-200 dark:border-amber-900/50'
                      }`}>
                        {meta.visibility === 'public' ? 'Público' : 'Privado'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 break-words">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {meta.description || 'Sem descrição.'}
                    </p>
                  </Link>
                  <div className="px-5 py-3 bg-gray-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Package className="w-4 h-4" />
                      {count} Produtos
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleDuplicate(cat.id, e)}
                        disabled={isDuplicating === cat.id}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Duplicar Categoria"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCategoryToDelete(cat);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-neutral-800 text-xs uppercase text-gray-500 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Categoria</th>
                  <th className="px-6 py-4 font-semibold">Visibilidade</th>
                  <th className="px-6 py-4 font-semibold">Produtos</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {categories.map((cat) => {
                  let meta = { visibility: 'public', description: '' };
                  try {
                    if (cat.metadata) meta = { ...meta, ...JSON.parse(cat.metadata) };
                  } catch (e) {}
                  
                  const count = postCounts[cat.id] ?? '...';

                  return (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/produtos/lista?slug=${cat.slug}`} className="flex items-center gap-3 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition-colors">
                          <Package className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-emerald-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{cat.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{meta.description || 'Sem descrição.'}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          meta.visibility === 'public' 
                            ? 'bg-green-50 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-green-200 dark:border-emerald-900/50'
                            : 'bg-orange-50 text-orange-700 dark:bg-amber-500/10 dark:text-amber-400 border border-orange-200 dark:border-amber-900/50'
                        }`}>
                          {meta.visibility === 'public' ? 'Público' : 'Privado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-300">
                          <Package className="w-4 h-4 text-gray-400" />
                          {count}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => handleDuplicate(cat.id, e)}
                            disabled={isDuplicating === cat.id}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Duplicar Categoria"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategoryToDelete(cat);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <CreateProductCategoryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchCategories}
        />

        <DeleteCategoryModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          category={categoryToDelete}
          allCategories={categories}
          onSuccess={fetchCategories}
        />
      </PageContainer>
    </DashboardLayout>
  );
}
