'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCollectionBySlug, getDocuments, deleteDocument } from '@/core/content/actions';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Settings, Images, ArrowLeft, Trash2, Edit2, Search, ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function BannerItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const [collection, setCollection] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    const col = await getCollectionBySlug(slug);
    if (!col) {
      router.push('/banners');
      return;
    }
    setCollection(col);
    const docs = await getDocuments(col.id);
    setDocuments(docs.sort((a: any, b: any) => (a.data?.order || 0) - (b.data?.order || 0)));
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const handleCreatePost = () => {
    router.push(`/banners/item?slug=${collection?.slug}&id=nova`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este banner?')) return;
    const toastId = toast.loading('Excluindo banner...');
    try {
      const res = await deleteDocument(id, slug);
      if (res.success) {
        toast.success('Banner excluído com sucesso!', { id: toastId });
        setDocuments(prev => prev.filter(d => d.id !== id));
      } else {
        toast.error('Erro ao excluir: ' + res.error, { id: toastId });
      }
    } catch (err: any) {
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
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/banners" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {collection?.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gerencie os slides/banners deste carrossel.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreatePost}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Novo Banner
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-gray-500 rounded-2xl flex items-center justify-center mb-4">
                <Images className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Nenhum banner cadastrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Comece adicionando seu primeiro banner neste carrossel.</p>
              <button
                onClick={handleCreatePost}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Banner
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-neutral-950/50 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-24">Imagem</th>
                    <th className="px-6 py-4 font-semibold">Título</th>
                    <th className="px-6 py-4 font-semibold">Ordem</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {documents.map((doc) => {
                    const data = doc.data || {};
                    const isActive = data.active !== false;

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                        <td className="px-6 py-3">
                          <button 
                            onClick={() => (data.image || data.imageUrl) && setSelectedImage(data.image || data.imageUrl)}
                            className="w-16 h-12 bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                            type="button"
                          >
                            {(data.image || data.imageUrl) ? (
                              <img src={data.image || data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                            {data.title || 'Sem título'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {data.subtitle || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {data.order || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-400'}`}>
                            {isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/banners/item?slug=${collection.slug}&id=${doc.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(doc.id)}
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
          )}
        </div>
        
        {/* Image Popup Modal */}
        {selectedImage && (
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function BannerItemsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <BannerItemsContent />
    </Suspense>
  )
}
