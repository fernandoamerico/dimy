'use client';

import { useEffect, useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCollectionBySlug, getDocuments, deleteDocument, createDocument } from '@/core/content/actions';
import { getCollections } from '@/core/schema/actions';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Settings, FileText, ArrowLeft, Trash2, Edit2, Search, Filter, ChevronLeft, ChevronRight, X, Copy } from 'lucide-react';
import { DeleteCategoryModal } from '@/components/publications/DeleteCategoryModal';
import { toast } from 'sonner';
import Link from 'next/link';

function PublicationItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const [collection, setCollection] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [deleteItem, setDeleteItem] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filtros e Paginação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Exclusão de categoria
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    const col = await getCollectionBySlug(slug);
    if (!col) {
      router.push('/publicacoes');
      return;
    }
    setCollection(col);
    const docs = await getDocuments(col.id);
    setDocuments(docs);
    
    const collections = await getCollections();
    setAllCategories(collections.filter((c: any) => {
      try {
        const meta = JSON.parse(c.metadata || '{}');
        return meta.is_publication === true;
      } catch (e) { return false; }
    }));

    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [slug]);

  // Aplicação dos filtros
  const filteredDocuments = documents.filter(doc => {
    const title = doc.data?._title || doc.data?.title || doc.data?.titulo || 'Publicação sem título';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isPublished = doc.data?._status === 'published';
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && isPublished) || 
                         (statusFilter === 'draft' && !isPublished);
                         
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage) || 1;
  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Voltar para a página 1 ao alterar os filtros
  useEffect(() => {
    setCurrentPage(1);
    setSelectedDocs([]); // Clear selection when filters change
  }, [searchQuery, statusFilter, itemsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocs(paginatedDocuments.map(doc => doc.id));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setDeleteItem({ type: 'bulk' });
  };

  const handleDuplicate = async (doc: any) => {
    try {
      const newData = { ...doc.data };
      if (newData._title) {
        newData._title = `${newData._title} (Cópia)`;
      }
      if (newData.title) {
        newData.title = `${newData.title} (Cópia)`;
      }
      if (newData.titulo) {
        newData.titulo = `${newData.titulo} (Cópia)`;
      }
      
      const res = await createDocument(collection.id, collection.slug, newData);
      if (res && res.success) {
        toast.success('Publicação duplicada com sucesso!');
        fetchContent();
      } else {
        toast.error('Erro ao duplicar a publicação.');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao duplicar a publicação.');
    }
  };

  const handleCreatePost = () => {
    router.push(`/publicacoes/item?slug=${collection?.slug}&id=nova`);
  };

  const handleDelete = (id: string) => {
    setDeleteItem({ type: 'single', id });
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
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/publicacoes" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {collection?.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gerencie as publicações desta categoria.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl transition-colors"
              title="Excluir Categoria"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Categoria
            </button>
            <Link 
              href={`/publicacoes/configuracoes?slug=${collection?.slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>
            <button
              onClick={handleCreatePost}
              disabled={isCreating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Nova Publicação
            </button>
          </div>
        </div>

        {/* List */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhuma publicação ainda
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Você ainda não criou nenhum item para {collection?.name}. Clique no botão abaixo para começar.
            </p>
            <button
              onClick={handleCreatePost}
              disabled={isCreating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Publicação
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toolbar (Busca e Filtros) */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar publicações..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-shadow text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-3">
                {selectedDocs.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-medium rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Selecionados ({selectedDocs.length})
                  </button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Filter className="w-4 h-4" />
                  <span>Status:</span>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Rascunhos</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-neutral-800 text-xs uppercase text-gray-500 dark:text-neutral-400">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input 
                        type="checkbox"
                        checked={paginatedDocuments.length > 0 && selectedDocs.length === paginatedDocuments.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
                      />
                    </th>
                    <th className="px-6 py-4 font-semibold">Título</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Última Atualização</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {paginatedDocuments.length > 0 ? paginatedDocuments.map((doc) => {
                    const title = doc.data?._title || doc.data?.title || doc.data?.titulo || 'Publicação sem título';
                    const isPublished = doc.data?._status === 'published';
                    return (
                      <tr key={doc.id} className={`transition-colors group ${selectedDocs.includes(doc.id) ? 'bg-blue-50/50 dark:bg-emerald-500/5' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50'}`}>
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => handleSelectOne(doc.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {doc.data?._cover?.image ? (
                              <button
                                onClick={() => setSelectedImage(doc.data._cover.image)}
                                className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                                type="button"
                              >
                                <img src={doc.data._cover.image} alt={title} className="w-full h-full object-cover bg-gray-100" />
                              </button>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isPublished ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200 rounded-full dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50">
                              Publicado
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200 rounded-full dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                              Rascunho
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDuplicate(doc)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <Link href={`/publicacoes/item?slug=${collection.slug}&id=${doc.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(doc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Nenhuma publicação encontrada para os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredDocuments.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400 px-2">
                <div className="flex items-center gap-2">
                  <span>Itens por página:</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-4">
                  <span>Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} de {filteredDocuments.length}</span>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DeleteCategoryModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          category={collection}
          allCategories={allCategories}
          onSuccess={() => router.push('/publicacoes')}
        />

        {deleteItem && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Excluir {deleteItem.type === 'bulk' ? 'Publicações' : 'Publicação'}?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tem certeza que deseja apagar permanentemente {deleteItem.type === 'bulk' ? `estas ${selectedDocs.length} publicações` : 'esta publicação'}? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-neutral-800/50 flex gap-3">
                <button
                  onClick={() => setDeleteItem(null)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (deleteItem.type === 'bulk') {
                        await Promise.all(selectedDocs.map(id => deleteDocument(id, collection.slug)));
                        toast.success(`${selectedDocs.length} publicações excluídas!`);
                        setSelectedDocs([]);
                      } else if (deleteItem.id) {
                        const res = await deleteDocument(deleteItem.id, collection.slug);
                        if (res.success) toast.success('Publicação excluída!');
                        else toast.error('Erro ao excluir publicação.');
                      }
                      fetchContent();
                    } catch (error) {
                      toast.error('Erro ao excluir.');
                    }
                    setDeleteItem(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
        
        {selectedImage && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                title="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={selectedImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
            </div>
          </div>,
          document.body
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PublicationItemsPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="p-8 text-center text-gray-500">Carregando...</div></DashboardLayout>}>
      <PublicationItemsContent />
    </Suspense>
  )
}
