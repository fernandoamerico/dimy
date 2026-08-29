'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCollectionBySlug, getDocuments, deleteDocument } from '@/core/content/actions';
import { getCollections } from '@/core/schema/actions';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Settings, Package, ArrowLeft, Trash2, Edit2, Tags } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function ProductItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const [collection, setCollection] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    
    // Fetch categories to allow filtering/selecting
    const collections = await getCollections();
    const productCategories = collections.filter((col: any) => {
      try {
        const meta = col.metadata ? JSON.parse(col.metadata) : {};
        return meta.is_product === true;
      } catch {
        return false;
      }
    });
    setAllCategories(productCategories);

    if (slug) {
      const col = await getCollectionBySlug(slug);
      if (col) {
        setCollection(col);
        const docs = await getDocuments(col.id);
        setDocuments(docs);
      }
    } else if (productCategories.length > 0) {
      // Se não tem slug, pega todos os documentos de todas as categorias de produto
      let allDocs: any[] = [];
      for (const cat of productCategories) {
        const docs = await getDocuments(cat.id);
        // anexa a categoria para mostrar na tabela
        const docsWithCat = docs.map((d: any) => ({ ...d, _categoryName: cat.name, _categorySlug: cat.slug }));
        allDocs = [...allDocs, ...docsWithCat];
      }
      setDocuments(allDocs);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const handleDelete = async (id: string, itemSlug: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    const res = await deleteDocument(id, itemSlug);
    if (res.success) {
      toast.success('Produto excluído!');
      fetchContent();
    } else {
      toast.error('Erro ao excluir produto.');
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
            <Link href="/produtos" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {collection ? collection.name : 'Todos os Produtos'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {collection ? 'Gerencie os produtos desta categoria.' : 'Visão geral de todos os produtos do catálogo.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {collection && (
              <Link 
                href={`/produtos/categorias/builder?id=${collection.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                <Settings className="w-4 h-4" />
                Configurar Esqueleto
              </Link>
            )}
            {allCategories.length > 0 && (
              <div className="relative group">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/20">
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-2">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Escolha a categoria:</div>
                  {allCategories.map(cat => (
                    <Link key={cat.id} href={`/produtos/item?slug=${cat.slug}&id=novo`} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Você ainda não cadastrou produtos {collection ? 'nesta categoria' : ''}. Clique no botão acima para começar.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-neutral-800 text-xs uppercase text-gray-500 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Produto</th>
                  {!collection && <th className="px-6 py-4 font-semibold">Categoria</th>}
                  <th className="px-6 py-4 font-semibold">SKU / Preço</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {documents.map((doc) => {
                  const title = doc.data?._title || doc.data?.title || 'Produto sem nome';
                  const sku = doc.data?._sku || '-';
                  const price = doc.data?._price ? `R$ ${parseFloat(doc.data._price).toFixed(2)}` : '-';
                  const isAvailable = doc.data?._status === 'available';
                  const itemSlug = collection ? collection.slug : doc._categorySlug;
                  
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {doc.data?._mainImage ? (
                            <img src={doc.data._mainImage} alt={title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                        </div>
                      </td>
                      {!collection && (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                            <Tags className="w-3 h-3" />
                            {doc._categoryName}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 dark:text-white font-medium">{price}</span>
                          <span className="text-xs text-gray-400">SKU: {sku}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isAvailable ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200 rounded-full dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50">
                            Disponível
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 rounded-full dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/50">
                            Esgotado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/produtos/item?slug=${itemSlug}&id=${doc.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(doc.id, itemSlug)}
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

export default function ProductItemsPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Carregando...</div></DashboardLayout>}>
      <ProductItemsContent />
    </Suspense>
  )
}
