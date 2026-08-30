'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDocument, createDocument } from '@/core/content/actions';
import { PageContainer } from '@/components/layout/PageContainer';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { GalleryBlockEditor } from '@/components/ui/GalleryBlockEditor';
import { WysiwygEditor } from '@/components/ui/WysiwygEditor';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { 
  ArrowLeft, Type, Image as ImageIcon, 
  List, MousePointerClick, Save, Trash2, Plus, Settings, Library
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function PostEditor({
  collection,
  document,
  isNew = false
}: {
  collection: any;
  document?: any;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize data
  const [formData, setFormData] = useState<Record<string, any>>(document?.data || {});
  const [galleryLibraryOpenFor, setGalleryLibraryOpenFor] = useState<string | null>(null);
  
  // Publication metadata defaults
  const [title, setTitle] = useState(formData._title || '');
  const [status, setStatus] = useState<'draft' | 'published'>(formData._status || 'draft');
  const [publishDate, setPublishDate] = useState(formData._publishDate || new Date().toISOString().split('T')[0]);
  const [author, setAuthor] = useState(formData._author || '');
  
  // SEO
  const [seo, setSeo] = useState(formData._seo || { title: '', description: '', keywords: '' });
  
  // Cover
  const [cover, setCover] = useState(formData._cover || { image: '', alt: '' });

  // Fields from collection
  const fields = collection.fields || [];

  // Parse collection metadata to know which panels to show
  const meta = (() => {
    try { return collection.metadata ? JSON.parse(collection.metadata) : {}; } catch { return {}; }
  })();

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('O título da publicação é obrigatório.');
      return;
    }

    setIsSubmitting(true);

    const dataToSave = {
      ...formData,
      _title: title,
      _status: status,
      _publishDate: publishDate,
      _author: author,
      _seo: seo,
      _cover: cover,
    };

    if (isNew) {
      const res = await createDocument(collection.id, collection.slug, dataToSave);
      if (res.success) {
        toast.success('Publicação criada!');
        router.push(`/publicacoes/list?slug=${collection.slug}`);
        router.refresh();
      } else {
        toast.error(res.error || 'Erro ao criar publicação.');
      }
    } else {
      const res = await updateDocument(document.id, collection.slug, dataToSave);
      if (res.success) {
        toast.success('Publicação salva!');
        router.refresh();
      } else {
        toast.error(res.error || 'Erro ao salvar publicação.');
      }
    }

    setIsSubmitting(false);
  };

  // ─── Render field editor ──────────────────────────────────────────────────
  const renderFieldEditor = (field: any) => {
    const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white";

    switch (field.type) {
      case 'text':
        return <input type="text" value={formData[field.name] || ''} onChange={e => handleChange(field.name, e.target.value)}
          placeholder={`Digite ${field.label.toLowerCase()}...`} className={inputClass} />;

      case 'richText':
        return <textarea value={formData[field.name] || ''} onChange={e => handleChange(field.name, e.target.value)}
          placeholder={`Escreva o conteúdo para ${field.label.toLowerCase()}...`} rows={6} className={`${inputClass} resize-y`} />;

      case 'wysiwyg':
        return <WysiwygEditor value={formData[field.name] || ''} onChange={val => handleChange(field.name, val)} />;

      case 'image':
        return (
          <div className="flex flex-col gap-3">
            <ImageUploader 
              value={formData[field.name] || ''}
              onChange={url => handleChange(field.name, url)} 
              placeholder="URL ou Upload da Imagem"
            />
            {formData[field.name] ? (
              <div className="w-full h-48 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50 dark:bg-neutral-950">
                <img src={formData[field.name]} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            ) : (
              <div className="w-full h-24 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-950/50 flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-6 h-6 mb-2 opacity-50" /><span className="text-xs">Insira uma URL ou faça upload</span>
              </div>
            )}
          </div>
        );

      case 'gallery': {
        const rawVal = formData[field.name];
        const galleryVal = Array.isArray(rawVal) ? rawVal : [];
        return (
          <GalleryBlockEditor
            urls={galleryVal}
            onChange={(urls) => handleChange(field.name, urls)}
          />
        );
      }

      case 'url':
        return <input type="url" value={formData[field.name] || ''} onChange={e => handleChange(field.name, e.target.value)}
          placeholder="https://exemplo.com" className={inputClass} />;

      case 'table': {
        const rawVal = formData[field.name];
        const tableVal = Array.isArray(rawVal) ? rawVal : [['', ''], ['', '']];
        return (
          <div className="space-y-3">
            <div className="dark:border dark:border-neutral-700 rounded-xl overflow-hidden dark:shadow-sm bg-white dark:bg-neutral-900">
              <table className="w-full text-sm text-left">
                <tbody>
                  {tableVal.map((row: string[], ri: number) => (
                    <tr key={ri} className="border-b border-gray-300 dark:border-neutral-700 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50">
                      {row.map((col: string, ci: number) => (
                        <td key={ci} className="p-0 border-r border-gray-300 dark:border-neutral-700 last:border-r-0 relative">
                          <input type="text" value={col}
                            onChange={e => { const t = tableVal.map((r: string[]) => [...r]); t[ri][ci] = e.target.value; handleChange(field.name, t); }}
                            className="w-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50/50 dark:focus:bg-emerald-500/10 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-900 dark:text-white text-sm transition-colors" />
                        </td>
                      ))}
                      <td className="p-2 w-10 text-center">
                        <button onClick={() => { if (tableVal.length > 1) { const t = tableVal.filter((_, i) => i !== ri); handleChange(field.name, t); } }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded disabled:opacity-30" disabled={tableVal.length <= 1}><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleChange(field.name, [...tableVal, new Array(tableVal[0]?.length || 2).fill('')])}
                className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline flex items-center gap-1">+ Adicionar Linha</button>
              <button onClick={() => handleChange(field.name, tableVal.map((r: string[]) => [...r, '']))}
                className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline flex items-center gap-1">+ Adicionar Coluna</button>
              <button onClick={() => { if (tableVal[0].length > 1) handleChange(field.name, tableVal.map((r: string[]) => r.slice(0, -1))) }}
                disabled={tableVal[0].length <= 1} className="text-sm font-medium text-red-500 hover:underline flex items-center gap-1 ml-auto disabled:opacity-30">Remover Coluna</button>
            </div>
          </div>
        );
      }

      case 'button': {
        const rawVal = formData[field.name];
        const btnVal = (typeof rawVal === 'object' && rawVal !== null && !Array.isArray(rawVal)) ? rawVal : { label: '', url: '' };
        return (
          <div className="flex items-center gap-3">
            <input type="text" value={btnVal.label} onChange={e => handleChange(field.name, { ...btnVal, label: e.target.value })}
              placeholder="Texto do Botão" className={inputClass} />
            <input type="url" value={btnVal.url} onChange={e => handleChange(field.name, { ...btnVal, url: e.target.value })}
              placeholder="URL de Destino" className={inputClass} />
          </div>
        );
      }

      case 'toggle': {
        const rawVal = formData[field.name];
        const togVal = typeof rawVal === 'boolean' ? rawVal : false;
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChange(field.name, !togVal)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                togVal ? 'bg-lime-500' : 'bg-gray-200 dark:bg-neutral-700'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                togVal ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {togVal ? 'Ligado' : 'Desligado'}
            </span>
          </div>
        );
      }

      case 'select': {
        const opts: string[] = field.options || [];
        const rawVal = formData[field.name];
        const selVal = typeof rawVal === 'string' ? rawVal : '';
        return (
          <select
            value={selVal}
            onChange={e => handleChange(field.name, e.target.value)}
            className={`${inputClass} cursor-pointer text-left`}
          >
            <option value="">Selecione uma opção...</option>
            {opts.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }

      case 'multiselect': {
        const opts: string[] = field.options || [];
        const rawVal = formData[field.name];
        const multiVal: string[] = Array.isArray(rawVal) ? rawVal : [];
        const toggleOpt = (opt: string) => {
          const newVal = multiVal.includes(opt)
            ? multiVal.filter((v: string) => v !== opt)
            : [...multiVal, opt];
          handleChange(field.name, newVal);
        };
        return (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl min-h-[48px]">
            {opts.length === 0 && (
              <span className="text-sm text-gray-400 italic">Nenhuma opção definida no esqueleto.</span>
            )}
            {opts.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleOpt(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  multiVal.includes(opt)
                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                    : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/publicacoes/list?slug=${collection.slug}`} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isNew ? 'Nova Publicação' : 'Editar Publicação'}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                {collection.name}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Preencha os campos para sua publicação.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Publicação'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ─── EDITOR (left 2/3) ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800 space-y-2">
             <label className="text-sm font-semibold text-gray-900 dark:text-white block">Título da Publicação *</label>
             <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Digite o título principal..." 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white text-lg font-medium" />
          </div>

          {fields.length === 0 ? (
            <div className="bg-white/60 dark:bg-neutral-900/60 border border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Esta categoria não possui campos configurados.</p>
            </div>
          ) : (
            fields.map((field: any, index: number) => (
              <div key={index} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{field.label}</h3>
                </div>
                {renderFieldEditor(field)}
              </div>
            ))
          )}
        </div>

        {/* ─── SIDEBAR (right 1/3) ─────────────────────────────────────────── */}
        <div className="space-y-4">
          
          {meta.enable_status !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-400" /> Publicação</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setStatus('draft')} 
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${status === 'draft' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700'}`}>
                      Rascunho
                    </button>
                    <button onClick={() => setStatus('published')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${status === 'published' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700'}`}>
                      Publicado
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Data de Publicação</label>
                  <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white text-sm" />
                </div>
              </div>
            </div>
          )}

          {meta.enable_author !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Type className="w-4 h-4 text-blue-500" /> Autor</h3>
              <div>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nome do autor"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>
          )}

          {meta.enable_cover !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-amber-500" /> Capa</h3>
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">URL ou Arquivo da Capa</label>
                <ImageUploader value={cover.image} onChange={url => setCover({ ...cover, image: url })} />
                {cover.image && (
                  <div className="w-full h-32 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
                    <img src={cover.image} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {meta.enable_seo !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-400" /> SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Meta Title</label>
                  <input type="text" value={seo.title} onChange={e => setSeo({ ...seo, title: e.target.value })} placeholder="Ex: Meu Post"
                    className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Meta Description</label>
                  <textarea value={seo.description} onChange={e => setSeo({ ...seo, description: e.target.value })} rows={3}
                    className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageContainer>
  );
}
