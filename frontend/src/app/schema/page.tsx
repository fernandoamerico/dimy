import Link from 'next/link';
import { getCollections, deleteCollection } from '@/core/schema/actions';
import { Database, Plus, Settings2, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function SchemaBuilderPage() {
  const collections = await getCollections();

  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await deleteCollection(id);
    revalidatePath('/schema');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Construtor de Coleções
          </h1>
          <p className="text-gray-500 mt-1">
            Crie as tabelas e campos do seu CMS sem escrever código.
          </p>
        </div>
        
        <Link 
          href="/schema/nova"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Coleção
        </Link>
      </div>

      <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-sm overflow-hidden">
        {collections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nenhuma coleção criada</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Você ainda não tem nenhuma tabela no banco de dados. Crie sua primeira coleção para começar a gerenciar conteúdo.
            </p>
            <Link 
              href="/schema/nova"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Criar Coleção
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {collections.map((col: any) => (
              <li key={col.id} className="p-4 sm:p-6 hover:bg-white/40 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {col.name}
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-mono">
                      {col.slug}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {col.fields.length} {col.fields.length === 1 ? 'campo configurado' : 'campos configurados'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link 
                    href={`/schema/${col.id}`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
                  >
                    <Settings2 className="w-4 h-4" />
                    Editar
                  </Link>
                  <form action={handleDelete} className="flex-1 sm:flex-none">
                    <input type="hidden" name="id" value={col.id} />
                    <button 
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm text-sm font-medium"
                      title="Excluir Coleção"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
