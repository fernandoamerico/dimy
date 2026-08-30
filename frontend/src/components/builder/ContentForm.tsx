import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDocument, updateDocument } from '@/core/content/actions';
import { ArrowLeft, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/ui/ImageUploader';

export function ContentForm({ 
  collection, 
  initialData = {}, 
  documentId = null,
  backUrl
}: { 
  collection: any, 
  initialData?: any,
  documentId?: string | null,
  backUrl?: string
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  
  const resolvedBackUrl = backUrl || `/content/list?slug=${collection.slug}`;

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result;
    if (documentId) {
      result = await updateDocument(documentId, collection.slug, formData);
    } else {
      result = await createDocument(collection.id, collection.slug, formData);
    }

    if (result.success) {
      toast.success('Conteúdo salvo com sucesso!');
      router.push(resolvedBackUrl);
    } else {
      toast.error('Erro ao salvar: ' + result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Link href={resolvedBackUrl} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {documentId ? `Editar ${collection.name}` : `Novo ${collection.name}`}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Preencha os campos abaixo para salvar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-md dark:border dark:border-neutral-800 rounded-3xl p-6 sm:p-8 dark:shadow-sm space-y-6">
            
            {(collection.fields || []).map((field: any) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-red-500 text-xs">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input 
                    type="text" 
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white transition-shadow"
                  />
                )}
                
                {field.type === 'richText' && (
                  <textarea 
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    rows={6}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white transition-shadow resize-y"
                  />
                )}
                
                {field.type === 'number' && (
                  <input 
                    type="number" 
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white transition-shadow"
                  />
                )}
                
                {field.type === 'boolean' && (
                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <input 
                      type="checkbox" 
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="w-5 h-5 text-blue-600 dark:text-emerald-500 rounded border-gray-300 dark:border-neutral-700 focus:ring-blue-500 dark:focus:ring-emerald-500 bg-white dark:bg-neutral-900"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sim / Ativo</span>
                  </label>
                )}
                
                {field.type === 'image' && (
                  <div className="flex flex-col gap-3">
                    <ImageUploader 
                      value={formData[field.name] || ''}
                      onChange={(url) => handleChange(field.name, url)}
                      placeholder="Imagem"
                    />
                  </div>
                )}
              </div>
            ))}

          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link 
              href={`/content/list?slug=${collection.slug}`}
              className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 dark:bg-emerald-500 rounded-xl hover:bg-blue-700 dark:hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
      </form>
      </div>
    </PageContainer>
  );
}
