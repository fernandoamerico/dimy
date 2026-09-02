'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDocument, createDocument, getDocuments } from '@/core/content/actions';
import { slugify } from '@/core/utils/slug';
import { PageContainer } from '@/components/layout/PageContainer';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { GalleryBlockEditor } from '@/components/ui/GalleryBlockEditor';
import { WysiwygEditor } from '@/components/ui/WysiwygEditor';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { 
  ArrowLeft, Type, Image as ImageIcon, 
  List, MousePointerClick, Save, Trash2, Plus, Settings, Library, Hash
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
  const [slug, setSlug] = useState(formData._slug || (formData._title ? slugify(formData._title) : ''));
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(formData._slug));
  const [status, setStatus] = useState<'draft' | 'published'>(formData._status || 'draft');
  const [publishDate, setPublishDate] = useState(formData._publishDate || new Date().toISOString().split('T')[0]);
  const [author, setAuthor] = useState(formData._author || '');
  const [priority, setPriority] = useState<number | ''>(formData._priority ?? '');
  
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

    const finalSlug = slug.trim() ? slug.trim() : slugify(title);

    // Validação de unicidade do slug
    const allDocs = await getDocuments(collection.id);
    const isDuplicate = allDocs.some((d: any) => d.data?._slug === finalSlug && d.id !== document?.id);
    if (isDuplicate) {
      toast.error('Este slug (URL) já está em uso por outra publicação. Por favor, modifique o slug.');
      setIsSubmitting(false);
      return;
    }

    const dataToSave = {
      ...formData,
      _title: title,
      _slug: finalSlug,
      _status: status,
      _publishDate: publishDate,
      _author: author,
      _priority: priority,
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
    return (
      <BlockRenderer 
        field={field} 
        value={formData[field.name]} 
        onChange={(val) => handleChange(field.name, val)} 
      />
    );
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
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800 space-y-4">
             <div>
               <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Título da Publicação *</label>
               <input type="text" value={title} onChange={e => {
                 setTitle(e.target.value);
                 if (!isSlugManuallyEdited) {
                   setSlug(slugify(e.target.value));
                 }
               }}
                placeholder="Digite o título principal..." 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white text-lg font-medium" />
             </div>
             <div>
               <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Slug (URL Amigável)</label>
               <input type="text" value={slug} onChange={e => {
                 setSlug(e.target.value);
                 setIsSlugManuallyEdited(true);
               }}
                placeholder="ex: meu-primeiro-post" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-500 dark:text-gray-400 font-mono text-sm" />
             </div>
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

          {meta.enable_priority === true && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Hash className="w-4 h-4 text-blue-500" /> Prioridade / Ordem</h3>
              <div>
                <input type="number" value={priority} onChange={e => setPriority(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 1, 2, 3..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white text-sm" />
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
                <ImageUploader value={cover.image} onChange={url => setCover({ ...cover, image: url })} layout="col" />
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
