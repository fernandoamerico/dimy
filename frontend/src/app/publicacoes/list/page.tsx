'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCollectionBySlug, getDocuments, createDocument, deleteDocument } from '@/core/content/actions';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Settings, FileText, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
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
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const handleCreatePost = async () => {
    setIsCreating(true);
    // Create an empty document. The editor will handle filling it out.
    // We add a basic _title for internal display if none exists
    if (res.success && res.id) { 
      router.push(`/publicacoes/item?slug=${collection.slug}&id=${res.id}`);
    } else if (res.success) {
      router.push(`/content/nova?slug=${collection.slug}`);
    } else {
      toast.error('Erro ao criar publicação.');
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta publicação?')) return;
    const res = await deleteDocument(id, collection.slug);
    if (res.success) {
      toast.success('Publicação excluída!');
      fetchContent();
    } else {
      toast.error('Erro ao excluir publicação.');
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
            <Link 
              href={`/publicacoes/configuracoes?slug=${collection?.slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors shadow-sm"
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
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-neutral-800 text-xs uppercase text-gray-500 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Título</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Última Atualização</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {documents.map((doc) => {
                  const title = doc.data?._title || doc.data?.title || doc.data?.titulo || 'Publicação sem título';
                  const isPublished = doc.data?._status === 'published';
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
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
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/publicacoes/item?slug=${collection.slug}&id=${doc.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(doc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors">
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
      </div>
    </DashboardLayout>
  );
}

export default function PublicationItemsPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Carregando...</div></DashboardLayout>}>
      <PublicationItemsContent />
    </Suspense>
  )
}
