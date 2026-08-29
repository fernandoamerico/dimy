'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionBySlug, getDocuments, deleteDocument } from '@/core/content/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function ContentListContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const col = await getCollectionBySlug(slug);
        if (!col) {
          router.push('/404');
          return;
        }

        // If it's a page, redirect to page builder
        let isPage = false;
        let isPublication = false;
        try {
          const meta = col.metadata ? JSON.parse(col.metadata) : {};
          isPage = meta.is_page === true;
          isPublication = meta.is_publication === true;
        } catch (e) {}

        if (isPage) {
          router.push(`/paginas/item?slug=${slug}`);
          return;
        }
        
        if (isPublication) {
          router.push(`/publicacoes/list?slug=${slug}`);
          return;
        }

        const docs = await getDocuments(col.id);
        setCollection(col);
        setDocuments(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro?')) return;
    const res = await deleteDocument(id, slug);
    if (res.success) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-emerald-500"></div>
      </div>
    );
  }

  if (!collection) return null;

  const titleField = (collection.fields || []).find((f: any) => f.name === 'title' || f.name === 'nome' || f.name === 'name' || f.type === 'text');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
            {collection.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie o conteúdo da coleção {collection.name}.
          </p>
        </div>
        
        <Link 
          href={`/content/nova?slug=${collection.slug}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-emerald-600 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Registro
        </Link>
      </div>

      <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-slate-200/50 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-emerald-500/10 text-blue-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Nenhum registro encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Esta coleção está vazia. Comece adicionando um novo registro.
            </p>
            <Link 
              href={`/content/nova?slug=${collection.slug}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Criar {collection.name}
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50/50 dark:bg-neutral-950/50 text-gray-700 dark:text-gray-300 uppercase font-medium border-b border-gray-200/50 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4">
                    {titleField ? titleField.label : 'ID'}
                  </th>
                  <th className="px-6 py-4 w-48">Criado em</th>
                  <th className="px-6 py-4 w-32 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {documents.map((doc: any) => {
                  let displayValue = doc.id;
                  if (titleField && doc.data[titleField.name]) {
                    displayValue = doc.data[titleField.name];
                  }

                  return (
                    <tr key={doc.id} className="hover:bg-white/40 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                        {String(displayValue).length > 60 ? String(displayValue).substring(0, 60) + '...' : String(displayValue)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/content/item?slug=${collection.slug}&id=${doc.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
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
    </div>
  );
}

export default function ContentListPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Carregando...</div>}>
        <ContentListContent />
      </Suspense>
    </DashboardLayout>
  )
}
