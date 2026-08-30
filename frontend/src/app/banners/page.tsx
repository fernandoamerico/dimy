'use client';

import { useEffect, useState } from 'react';
import { getCollections, deleteCollection } from '@/core/schema/actions';
import { getDocuments } from '@/core/content/actions';
import { Images, Plus, Folder, Trash2, LayoutGrid, List } from 'lucide-react';
import CreateCarouselModal from '@/components/banners/CreateCarouselModal';
import Link from 'next/link';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';

export default function BannersPage() {
  const [carousels, setCarousels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  const fetchCarousels = async () => {
    try {
      setLoading(true);
      const allCollections = await getCollections();
      
      const bannerCollections = allCollections.filter((col: any) => {
        if (!col.metadata) return false;
        try {
          const meta = JSON.parse(col.metadata);
          return meta.is_banner === true;
        } catch (e) {
          return false;
        }
      });
      
      setCarousels(bannerCollections);
      
      const counts: Record<string, number> = {};
      await Promise.all(bannerCollections.map(async (cat: any) => {
        try {
          const docs = await getDocuments(cat.id);
          counts[cat.id] = docs.length;
        } catch (e) {
          counts[cat.id] = 0;
        }
      }));
      setItemCounts(counts);

    } catch (error) {
      console.error("Failed to fetch carousels", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Excluir este carrossel? Todos os banners dentro dele serão perdidos.')) return;
    
    const toastId = toast.loading('Excluindo carrossel...');
    try {
      const res = await deleteCollection(id);
      if (res.success) {
        toast.success('Carrossel excluído com sucesso!', { id: toastId });
        fetchCarousels();
      } else {
        toast.error('Erro ao excluir: ' + res.error, { id: toastId });
      }
    } catch (err) {
      toast.error('Erro de conexão.', { id: toastId });
    }
  };

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
              <Images className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
              Banners e Carrosséis
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gerencie seus grupos de banners (ex: Home Hero, Parceiros).
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
              Novo Carrossel
            </button>
          </div>
        </div>

        {carousels.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Folder className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhum carrossel criado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Você ainda não possui nenhum carrossel. Crie seu primeiro grupo de banners para começar a gerenciar imagens.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Carrossel
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carousels.map((cat) => {
              const meta = cat.metadata ? JSON.parse(cat.metadata) : {};
              const count = itemCounts[cat.id] || 0;
              
              return (
                <div key={cat.id} className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 hover:shadow-md hover:border-blue-200 dark:hover:border-emerald-500/30 transition-all overflow-hidden">
                  <Link href={`/banners/list?slug=${cat.slug}`} className="p-5 flex-1 block">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-emerald-400 group-hover:bg-blue-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                        <Images className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-blue-200 dark:border-emerald-900/50">
                        {count} {count === 1 ? 'Banner' : 'Banners'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {meta.description || 'Sem descrição'}
                    </p>
                  </Link>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 flex justify-end gap-3">
                    <button 
                      onClick={(e) => handleDelete(cat.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir Carrossel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link 
                      href={`/banners/list?slug=${cat.slug}`}
                      className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:text-blue-700 dark:hover:text-emerald-300 flex items-center gap-1"
                    >
                      Gerenciar Itens
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-neutral-950/50 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nome</th>
                    <th className="px-6 py-4 font-semibold">Descrição</th>
                    <th className="px-6 py-4 font-semibold">Itens</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {carousels.map((cat) => {
                    const meta = cat.metadata ? JSON.parse(cat.metadata) : {};
                    const count = itemCounts[cat.id] || 0;

                    return (
                      <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/banners/list?slug=${cat.slug}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                              <Images className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
                              {cat.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[300px] truncate">
                          {meta.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {count}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleDelete(cat.id, e)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Excluir"
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
          </div>
        )}

        <CreateCarouselModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchCarousels()}
        />
      </PageContainer>
    </DashboardLayout>
  );
}
