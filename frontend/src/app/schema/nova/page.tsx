'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCollection } from '@/core/schema/actions';
import { Database, Plus, Trash2, ArrowLeft, GripVertical } from 'lucide-react';
import Link from 'next/link';

type FieldDef = {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export default function NovaColecaoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([]);

  // Simple slug generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const addField = () => {
    setFields([
      ...fields, 
      { id: Math.random().toString(36).substring(7), name: '', label: '', type: 'text', required: false }
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: keyof FieldDef, value: string | boolean) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        const updated = { ...f, [key]: value };
        // auto generate field name based on label if name is empty
        if (key === 'label' && f.name === '') {
          updated.name = (value as string).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]+/g, '_').replace(/(^_|_$)+/g, '');
        }
        return updated;
      }
      return f;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return alert('Nome e Slug são obrigatórios');
    
    setIsSubmitting(true);
    const result = await createCollection({
      name,
      slug,
      fields: fields.map((f, index) => ({
        name: f.name || f.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label: f.label || 'Sem Nome',
        type: f.type,
        required: f.required,
        order: index
      }))
    });

    if (result.success) {
      router.push('/schema');
    } else {
      alert('Erro: ' + result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/schema" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Nova Coleção
          </h1>
          <p className="text-gray-500 mt-1">Defina o nome da tabela e quais campos ela terá.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Configurações Gerais</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nome da Coleção (Plural)</label>
              <input 
                type="text" 
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Artigos, Produtos" 
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Slug (ID na API)</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: artigos" 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow font-mono text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">Campos de Dados</h2>
            <button 
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Campo
            </button>
          </div>
          
          {fields.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-300">
              Nenhum campo definido. Adicione um campo para começar.
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 border border-gray-200 p-3 rounded-xl group relative">
                  <div className="text-gray-400 cursor-grab active:cursor-grabbing hidden sm:block">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <input 
                      type="text" 
                      placeholder="Nome de Exibição (Label)" 
                      value={field.label}
                      onChange={(e) => updateField(field.id, 'label', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    
                    <input 
                      type="text" 
                      placeholder="Chave no Banco (name)" 
                      value={field.name}
                      onChange={(e) => updateField(field.id, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    
                    <div className="flex gap-2">
                      <select 
                        value={field.type}
                        onChange={(e) => updateField(field.id, 'type', e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="text">Texto Curto</option>
                        <option value="richText">Rich Text (HTML)</option>
                        <option value="image">Imagem</option>
                        <option value="number">Número</option>
                        <option value="boolean">Verdadeiro/Falso</option>
                      </select>
                      
                      <label className="flex items-center gap-1.5 text-sm text-gray-700 bg-white border border-gray-300 px-2 rounded-md shrink-0 cursor-pointer hover:bg-gray-50">
                        <input 
                          type="checkbox" 
                          checked={field.required}
                          onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Req.
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors sm:absolute sm:-right-2 sm:-top-2 sm:opacity-0 sm:group-hover:opacity-100 sm:bg-white sm:border sm:border-gray-200 sm:shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link 
            href="/schema"
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>Salvando...</>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Criar Coleção
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
