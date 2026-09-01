'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCollections, deleteCollection, duplicateCollection } from '@/core/schema/actions';
import { FileText, Plus, Layers, Folder, Layout, Trash2, X, AlertTriangle, Copy, Settings } from 'lucide-react';
import CreatePageModal from '@/components/pages/CreatePageModal';
import EditPageModal from '@/components/pages/EditPageModal';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { toast } from 'sonner';

export default function PagesListPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pageToEdit, setPageToEdit] = useState<any>(null);

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDuplicating(id);
    const toastId = toast.loading('Duplicando página...');
    
    try {
      const res = await duplicateCollection(id);
      if (res.success) {
        toast.success('Página duplicada com sucesso!', { id: toastId });
        fetchPages();
      } else {
        toast.error('Erro ao duplicar: ' + res.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Erro de conexão ao duplicar.', { id: toastId });
    } finally {
      setIsDuplicating(null);
    }
  };

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

  const handleDeletePage = async () => {
    if (!pageToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCollection(pageToDelete.id);
      if (res.success) {
        toast.success('Página excluída com sucesso!');
        setPages(pages.filter(p => p.id !== pageToDelete.id));
        setIsDeleteModalOpen(false);
        setPageToDelete(null);
      } else {
        toast.error('Erro ao excluir: ' + res.error);
      }
    } catch (error: any) {
      toast.error('Erro de conexão ao excluir página.');
    } finally {
      setIsDeleting(false);
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
              <FileText className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
              Páginas (Categorias)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Crie e estruture suas páginas (ex: Home, Sobre Nós). Em cada página, você poderá adicionar múltiplas seções.
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
              Você ainda não possui nenhuma página principal. Crie sua primeira página, como "Home", para depois adicionar seções a ela.
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
                <div key={page.id} className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 dark:shadow-sm dark:hover:shadow-md hover:border-blue-200 dark:hover:border-emerald-500/30 transition-all overflow-hidden relative">
                  <Link href={`/paginas/list?slug=${page.slug}`} className="p-5 flex-1 block">
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 break-words">
                      {page.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {meta.description || 'Página baseada em seções.'}
                    </p>
                  </Link>
                  <div className="px-5 py-3 bg-gray-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Criado em {page.created_at ? new Date(page.created_at).toLocaleDateString('pt-BR') : '...'}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPageToEdit(page);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Configurações da Página"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDuplicate(page.id, e)}
                        disabled={isDuplicating === page.id}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Duplicar Página"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPageToDelete(page);
                          setIsDeleteModalOpen(true);
                        }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir Página"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
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
        
        <EditPageModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setPageToEdit(null);
          }}
          page={pageToEdit}
          onSuccess={() => {
            toast.success('Página atualizada com sucesso!');
            fetchPages();
          }}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-neutral-800 relative animate-in slide-in-from-bottom-4 duration-300">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Excluir Página</h2>
                <p className="text-gray-500 dark:text-neutral-400 mb-8">
                  Tem certeza que deseja excluir a página <strong className="text-gray-700 dark:text-gray-300">{pageToDelete?.name}</strong>? Todo o conteúdo será permanentemente apagado.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletePage}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
