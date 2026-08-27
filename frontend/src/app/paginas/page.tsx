'use client';

import { useEffect, useState } from 'react';
import { getCollections } from '@/core/schema/actions';
import { FileText, Plus, Layers, Folder, Layout } from 'lucide-react';
import CreatePageModal from '@/components/pages/CreatePageModal';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';

export default function PagesListPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const allCollections = await getCollections();
      
      const pageCollections = allCollections.filter((col: any) => {
        if (!col.metadata) return false;
        try {
          const meta = JSON.parse(col.metadata);
          return meta.is_page === true;
        } catch (e) {
          return false;
        }
      });
      
      setPages(pageCollections);
    } catch (error) {
      console.error("Failed to fetch pages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
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
              <FileText className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
              Páginas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Crie e estruture páginas únicas como Sobre Nós, Contato, Home, etc.
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Página
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Layout className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhuma página criada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Você ainda não possui nenhuma página única. Crie sua primeira página, como "Sobre Nós", para começar a montar a estrutura visual.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Página
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => {
              let meta = { visibility: 'public', description: '' };
              try {
                if (page.metadata) meta = { ...meta, ...JSON.parse(page.metadata) };
              } catch (e) {}

              return (
                <div key={page.id} className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 hover:shadow-md hover:border-blue-200 dark:hover:border-emerald-500/30 transition-all overflow-hidden">
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-emerald-400 group-hover:bg-blue-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        meta.visibility === 'public' 
                          ? 'bg-green-50 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-green-200 dark:border-emerald-900/50'
                          : 'bg-orange-50 text-orange-700 dark:bg-amber-500/10 dark:text-amber-400 border border-orange-200 dark:border-amber-900/50'
                      }`}>
                        {meta.visibility === 'public' ? 'Público' : 'Privado'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {page.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {meta.description || 'Página única estática.'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
                    <Link 
                      href={`/paginas/${page.slug}`}
                      className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:text-blue-700 dark:hover:text-emerald-300 flex items-center gap-1"
                    >
                      Editar Página
                      <Layout className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreatePageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </PageContainer>
    </DashboardLayout>
  );
}
