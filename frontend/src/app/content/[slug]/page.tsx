import { getCollectionBySlug, getDocuments, deleteDocument } from '@/core/content/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ContentListPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const collection = await getCollectionBySlug(slug);
  
  if (!collection) {
    notFound();
  }

  const documents = await getDocuments(collection.id);
  
  // Try to find a good field to use as the title/display name for the list
  const titleField = collection.fields.find((f: any) => f.name === 'title' || f.name === 'nome' || f.name === 'name' || f.type === 'text');

  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const slug = formData.get('slug') as string;
    await deleteDocument(id, slug);
    revalidatePath(`/content/${slug}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            {collection.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie o conteúdo da coleção {collection.name}.
          </p>
        </div>
        
        <Link 
          href={`/content/${collection.slug}/nova`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Registro
        </Link>
      </div>

      <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nenhum registro encontrado</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Esta coleção está vazia. Comece adicionando um novo registro.
            </p>
            <Link 
              href={`/content/${collection.slug}/nova`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Criar {collection.name}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-gray-700 uppercase font-medium border-b border-gray-200/50">
                <tr>
                  <th className="px-6 py-4">
                    {titleField ? titleField.label : 'ID'}
                  </th>
                  <th className="px-6 py-4 w-48">Criado em</th>
                  <th className="px-6 py-4 w-32 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc: any) => {
                  // Determine what to show in the main column
                  let displayValue = doc.id;
                  if (titleField && doc.data[titleField.name]) {
                    displayValue = doc.data[titleField.name];
                  }

                  return (
                    <tr key={doc.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
                        {String(displayValue).length > 60 ? String(displayValue).substring(0, 60) + '...' : String(displayValue)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/content/${collection.slug}/${doc.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          
                          <form action={handleDelete}>
                            <input type="hidden" name="id" value={doc.id} />
                            <input type="hidden" name="slug" value={collection.slug} />
                            <button 
                              type="submit"
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
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

export function generateStaticParams() { return []; }
