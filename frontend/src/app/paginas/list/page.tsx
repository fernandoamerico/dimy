'use client';

import { useEffect, useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCollectionBySlug, getDocuments, deleteDocument, createDocument, duplicateDocument } from '@/core/content/actions';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import EditPageModal from '@/components/pages/EditPageModal';
import { Plus, FileText, ArrowLeft, Trash2, Edit2, Search, Loader2, Copy, Settings } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function PaginasListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const [collection, setCollection] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');

  // Novo item
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionSlug, setNewSectionSlug] = useState('');

  const fetchContent = async () => {
    setLoading(true);
    const col = await getCollectionBySlug(slug);
    if (!col) {
      router.push('/paginas');
      return;
    }
    setCollection(col);
    const docs = await getDocuments(col.id);
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [slug]);

  // Aplicação dos filtros
  const filteredDocuments = documents.filter(doc => {
    const title = doc.data?.title || 'Seção sem título';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle) return;
    setIsCreating(true);

    let finalSlug = newSectionSlug.trim();
    if (!finalSlug) finalSlug = newSectionTitle;
    finalSlug = finalSlug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      const res = await createDocument(collection.id, collection.slug, {
        title: newSectionTitle,
        slug: finalSlug,
        status: 'draft',
        _fields: []
      });

      if (res && res.success) {
        setIsNewModalOpen(false);
        setNewSectionTitle('');
        setNewSectionSlug('');
        router.push(`/paginas/item?slug=${collection.slug}&id=${res.id}`);
      } else {
        toast.error('Erro ao criar a seção.');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao criar a seção.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateSection = async (docId: string) => {
    try {
      const res = await duplicateDocument(docId, collection.slug);
      if (res.success) {
        toast.success('Seção duplicada com sucesso!');
        fetchContent();
      } else {
        toast.error('Erro ao duplicar seção.');
      }
    } catch {
      toast.error('Ocorreu um erro ao duplicar a seção.');
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
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/paginas" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Página: {collection?.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gerencie as seções que compõem esta página.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/50"
              title="Configurações da Página"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Nova Seção
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
              Nenhuma seção ainda
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Sua página está vazia. Crie a primeira seção (como um Banner ou Rodapé) para começar a desenhar.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Seção
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toolbar (Busca) */}
            <div className="flex justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar seção..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-shadow text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
              <table className="w-full min-w-[500px] text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-neutral-800 text-xs uppercase text-gray-500 dark:text-neutral-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Título da Seção</th>
                    <th className="px-6 py-4 font-semibold">ID / Slug</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {filteredDocuments.length > 0 ? filteredDocuments.map((doc) => {
                    const title = doc.data?.title || 'Sem título';
                    const docSlug = doc.data?.slug || doc.id;
                    const isPublished = doc.data?.status === 'published';
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {docSlug}
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/paginas/item?slug=${collection.slug}&id=${doc.id}`}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-2 font-medium"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Editar Visual</span>
                            </Link>
                            <button onClick={() => handleDuplicateSection(doc.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteItem(doc.id)}
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
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Nenhuma seção encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <EditPageModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          page={collection}
          onSuccess={() => {
            fetchData();
          }}
        />

        {isNewModalOpen && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Criar Nova Seção</h3>
                <p className="text-sm text-gray-500">Ex: "Hero Banner", "Rodapé", "Depoimentos".</p>
              </div>
              <form onSubmit={handleCreateSection} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título da Seção</label>
                  <input
                    type="text"
                    required
                    value={newSectionTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      const oldFormatted = newSectionTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, '');
                      setNewSectionTitle(val);
                      if (!newSectionSlug || newSectionSlug === oldFormatted) {
                        setNewSectionSlug(val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white"
                    placeholder="Ex: Cabeçalho Principal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID / Slug Interno (Opcional)</label>
                  <input
                    type="text"
                    value={newSectionSlug}
                    onChange={(e) => {
                      const formatted = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\-]+/g, '-');
                      setNewSectionSlug(formatted);
                    }}
                    placeholder="Auto-gerado pelo título se vazio"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:text-white"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Seção'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Modal Excluir Seção */}
        {deleteItem && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-neutral-800">
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Excluir Seção?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tem certeza que deseja apagar permanentemente esta seção? Esta ação não pode ser desfeita.
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
                      const res = await deleteDocument(deleteItem, collection.slug);
                      if (res.success) {
                        toast.success('Seção excluída com sucesso!');
                        fetchContent();
                      } else {
                        toast.error('Erro ao excluir seção.');
                      }
                    } catch (error) {
                      toast.error('Erro ao excluir seção.');
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
        
      </div>
    </DashboardLayout>
  );
}

export default function PaginasListPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="p-8 text-center text-gray-500">Carregando...</div></DashboardLayout>}>
      <PaginasListContent />
    </Suspense>
  )
}
