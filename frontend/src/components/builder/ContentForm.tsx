'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDocument, updateDocument } from '@/core/content/actions';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export function ContentForm({ 
  collection, 
  initialData = {}, 
  documentId = null 
}: { 
  collection: any, 
  initialData?: any,
  documentId?: string | null 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

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
      router.push(`/content/${collection.slug}`);
    } else {
      alert('Erro ao salvar: ' + result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/content/${collection.slug}`} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {documentId ? `Editar ${collection.name}` : `Novo ${collection.name}`}
          </h1>
          <p className="text-gray-500 mt-1">
            Preencha os campos abaixo para salvar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-6">
          
          {collection.fields.map((field: any) => (
            <div key={field.id} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                {field.label}
                {field.required && <span className="text-red-500 text-xs">*</span>}
              </label>
              
              {field.type === 'text' && (
                <input 
                  type="text" 
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              )}
              
              {field.type === 'richText' && (
                <textarea 
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  rows={6}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-y"
                />
              )}
              
              {field.type === 'number' && (
                <input 
                  type="number" 
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              )}
              
              {field.type === 'boolean' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Sim / Ativo</span>
                </label>
              )}
              
              {field.type === 'image' && (
                <div className="flex flex-col gap-2">
                  <input 
                    type="url" 
                    placeholder="URL da Imagem (Ex: https://...)"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                  {formData[field.name] && (
                    <div className="mt-2 w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={formData[field.name]} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link 
            href={`/content/${collection.slug}`}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Salvando...' : (
              <>
                <Save className="w-4 h-4" />
                Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
