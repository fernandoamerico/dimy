'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDocument, createDocument, getDocuments } from '@/core/content/actions';
import { slugify } from '@/core/utils/slug';
import { resolveTemplateVariables } from '@/core/utils/template';
import { PageContainer } from '@/components/layout/PageContainer';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { GalleryBlockEditor } from '@/components/ui/GalleryBlockEditor';
import { WysiwygEditor } from '@/components/ui/WysiwygEditor';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { 
  ArrowLeft, Type, Image as ImageIcon, 
  List, MousePointerClick, Save, Trash2, Plus, Settings, Library, Hash, Globe, HelpCircle, X, FileText, Eye
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { usePermissions } from '@/core/hooks/usePermissions';

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
  const { canEdit } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);

  // Initialize data
  const [formData, setFormData] = useState<Record<string, any>>(document?.data || {});
  const [galleryLibraryOpenFor, setGalleryLibraryOpenFor] = useState<string | null>(null);
  
  // Publication metadata defaults
  const [title, setTitle] = useState(formData._title || '');
  const [slug, setSlug] = useState(formData._slug ? slugify(formData._slug) : (formData._title ? slugify(formData._title) : ''));
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(formData._slug));
  const [status, setStatus] = useState<'draft' | 'published'>(formData._status || 'draft');
  const [publishDate, setPublishDate] = useState(formData._publishDate || new Date().toISOString().split('T')[0]);
  const [author, setAuthor] = useState(formData._author || '');
  const [summary, setSummary] = useState(formData._summary || '');
  const [priority, setPriority] = useState<number | ''>(formData._priority ?? '');
  
  // SEO
  const [seo, setSeo] = useState(formData._seo || { title: '{title} | {site_name}', description: '{summary}', keywords: '' });
  const [showSeoHelp, setShowSeoHelp] = useState(false);

  // Fields from collection
  const fields = collection.fields || [];

  const baseVariables = [
    { code: '{title}', label: 'Título da publicação' },
    { code: '{slug}', label: 'Slug da URL' },
    { code: '{author}', label: 'Autor' },
    { code: '{summary}', label: 'Resumo do post' },
    { code: '{date}', label: 'Data de publicação' },
    { code: '{site_name}', label: 'Nome da categoria/site' },
  ];

  const blockVariables = fields.map((f: any) => ({
    code: `{${f.name}}`,
    label: `Bloco: ${f.label}`
  }));

  const seoVariables = [...baseVariables, ...blockVariables];
  
  // Cover
  const [cover, setCover] = useState(formData._cover || { image: '', alt: '' });

  // Parse collection metadata to know which panels to show
  const meta = (() => {
    try { return collection.metadata ? JSON.parse(collection.metadata) : {}; } catch { return {}; }
  })();

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async (mode: 'draft' | 'publish') => {
    if (!title.trim()) {
      toast.error('O título da publicação é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setSavingMode(mode);

    const newStatus = mode === 'publish' ? 'published' : 'draft';
    setStatus(newStatus);

    const finalSlug = slugify(slug.trim() || title);
    setSlug(finalSlug);

    // Validação de unicidade do slug
    const allDocs = await getDocuments(collection.id);
    const isDuplicate = allDocs.some((d: any) => d.data?._slug === finalSlug && d.id !== document?.id);
    if (isDuplicate) {
      toast.error('Este slug (URL) já está em uso por outra publicação. Por favor, modifique o slug.');
      setIsSubmitting(false);
      setSavingMode(null);
      return;
    }

    const finalSeo = {
      title: seo.title?.trim() ? seo.title.trim() : '{title} | {site_name}',
      description: seo.description?.trim() ? seo.description.trim() : '{summary}',
      keywords: seo.keywords || ''
    };

    const dataToSave = {
      ...formData,
      _title: title,
      _slug: finalSlug,
      _status: newStatus,
      _publishDate: publishDate,
      _author: author,
      _summary: summary,
      _priority: priority,
      _seo: finalSeo,
      _cover: cover,
    };

    if (isNew) {
      const res = await createDocument(collection.id, collection.slug, dataToSave);
      if (res.success && res.id) {
        toast.success(mode === 'publish' ? 'Publicação criada e publicada!' : 'Rascunho criado com sucesso!');
        router.replace(`/publicacoes/item?slug=${collection.slug}&id=${res.id}`);
        router.refresh();
      } else {
        toast.error(res.error || 'Erro ao criar publicação.');
      }
    } else {
      const res = await updateDocument(document.id, collection.slug, dataToSave);
      if (res.success) {
        toast.success(mode === 'publish' ? 'Publicação salva e publicada!' : 'Rascunho salvo com sucesso!');
        router.refresh();
      } else {
        toast.error(res.error || 'Erro ao salvar publicação.');
      }
    }

    setIsSubmitting(false);
    setSavingMode(null);
  };

  // ─── Render field editor ──────────────────────────────────────────────────
  const renderFieldEditor = (field: any) => {
    return (
      <BlockRenderer 
        field={field} 
        value={formData[field.name]} 
        onChange={(val) => handleChange(field.name, val)} 
        readOnly={!canEdit}
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isNew ? 'Nova Publicação' : (canEdit ? 'Editar Publicação' : 'Visualizar Publicação')}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                {collection.name}
              </span>
              {!canEdit && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Modo de Visualização (Auditor)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {canEdit ? 'Preencha os campos para sua publicação.' : 'Visualização em modo somente leitura.'}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSave('draft')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2 justify-center text-sm"
            >
              {savingMode === 'draft' ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-4 h-4" /> Salvar Rascunho</>
              )}
            </button>
            <button
              onClick={() => handleSave('publish')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 text-white bg-blue-600 dark:bg-emerald-500 rounded-xl hover:bg-blue-700 dark:hover:bg-emerald-600 font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 justify-center text-sm"
            >
              {savingMode === 'publish' ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publicando...</>
              ) : (
                <><Globe className="w-4 h-4" /> Salvar e Publicar</>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ─── EDITOR (left 2/3) ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800 space-y-4">
             <div>
               <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Título da Publicação *</label>
               <input type="text" value={title} 
                 readOnly={!canEdit}
                 onChange={e => {
                   if (!canEdit) return;
                   const newTitle = e.target.value;
                   setTitle(newTitle);
                   if (!isSlugManuallyEdited || !slug.trim()) {
                     setSlug(slugify(newTitle));
                   }
                 }}
                placeholder="Digite o título principal..." 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white text-lg font-medium" />
             </div>
             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="text-sm font-semibold text-gray-900 dark:text-white block">Slug (URL Amigável)</label>
                 <span className="text-[10px] text-gray-400 font-medium">Formatado automaticamente ao sair do campo</span>
               </div>
               <input type="text" value={slug} 
                 readOnly={!canEdit}
                 onChange={e => {
                   if (!canEdit) return;
                   const val = e.target.value;
                   setSlug(val);
                   if (val.trim() === '') {
                     setIsSlugManuallyEdited(false);
                   } else {
                     setIsSlugManuallyEdited(true);
                   }
                 }}
                 onBlur={() => {
                   if (!canEdit) return;
                   if (!slug.trim()) {
                     setSlug(slugify(title));
                     setIsSlugManuallyEdited(false);
                   } else {
                     setSlug(slugify(slug));
                   }
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
                    <button onClick={() => canEdit && setStatus('draft')} disabled={!canEdit}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${status === 'draft' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700'}`}>
                      Rascunho
                    </button>
                    <button onClick={() => canEdit && setStatus('published')} disabled={!canEdit}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${status === 'published' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700'}`}>
                      Publicado
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Data de Publicação</label>
                  <input type="date" value={publishDate} readOnly={!canEdit} onChange={e => canEdit && setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white text-sm" />
                </div>
              </div>
            </div>
          )}

          {meta.enable_priority === true && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Hash className="w-4 h-4 text-blue-500" /> Prioridade / Ordem</h3>
              <div>
                <input type="number" value={priority} readOnly={!canEdit} onChange={e => canEdit && setPriority(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 1, 2, 3..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>
          )}

          {meta.enable_author !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Type className="w-4 h-4 text-blue-500" /> Autor</h3>
              <div>
                <input type="text" value={author} readOnly={!canEdit} onChange={e => canEdit && setAuthor(e.target.value)} placeholder="Nome do autor"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>
          )}

          {meta.enable_summary !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Resumo do Post
                </h3>
                <span className={`text-[10px] font-semibold transition-colors ${summary.length > 140 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {summary.length}/140
                </span>
              </div>
              <div>
                <textarea 
                  value={summary} 
                  readOnly={!canEdit}
                  onChange={e => canEdit && setSummary(e.target.value)} 
                  rows={3} 
                  placeholder="Escreva um breve resumo da publicação..."
                  className={`w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border rounded-lg focus:outline-none text-gray-900 dark:text-white text-sm resize-none transition-colors ${
                    summary.length > 140 
                      ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-neutral-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500'
                  }`} 
                />
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" /> SEO
                </h3>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSeoHelp(!showSeoHelp)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    title="Ver Variáveis Disponíveis"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                    <span>Variáveis</span>
                  </button>

                  {showSeoHelp && (
                    <div className="absolute right-0 top-8 z-50 w-72 sm:w-80 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-xl p-4 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-neutral-700">
                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-blue-500" /> Variáveis de SEO
                        </span>
                        <button onClick={() => setShowSeoHelp(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                        Insira as variáveis abaixo nos campos. Elas serão substituídas dinamicamente pelas informações do post:
                      </p>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {seoVariables.map(v => (
                          <div key={v.code} className="flex items-center justify-between bg-gray-50 dark:bg-neutral-900 p-2 rounded-xl border border-gray-100 dark:border-neutral-700/50">
                            <div>
                              <code className="font-mono text-blue-600 dark:text-emerald-400 font-bold">{v.code}</code>
                              <span className="block text-[10px] text-gray-500 dark:text-gray-400">{v.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSeo((prev: any) => ({ ...prev, title: (prev.title ? prev.title + ' ' : '') + v.code }));
                                toast.success(`Variável ${v.code} inserida no Meta Title!`);
                              }}
                              className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded-lg font-medium transition-colors"
                            >
                              + Inserir
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Meta Title</label>
                    <span className={`text-[10px] font-semibold transition-colors ${seo.title.length > 140 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {seo.title.length}/140
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={seo.title} 
                    readOnly={!canEdit}
                    onChange={e => canEdit && setSeo({ ...seo, title: e.target.value })} 
                    placeholder="Ex: {title} | {site_name}"
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border rounded-lg text-sm focus:outline-none transition-colors ${
                      seo.title.length > 140 
                        ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-200 dark:border-neutral-800 focus:ring-2 focus:ring-blue-500'
                    }`} 
                  />
                  {canEdit && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span className="text-[10px] text-gray-400 mr-1 font-medium">Atalhos:</span>
                      {seoVariables.map(v => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setSeo((prev: any) => ({ ...prev, title: (prev.title ? prev.title + ' ' : '') + v.code }))}
                          className="text-[10px] font-mono bg-gray-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-neutral-800 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded transition-colors"
                          title={`Inserir ${v.label}`}
                        >
                          + {v.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Meta Description</label>
                    <span className={`text-[10px] font-semibold transition-colors ${seo.description.length > 140 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {seo.description.length}/140
                    </span>
                  </div>
                  <textarea 
                    value={seo.description} 
                    readOnly={!canEdit}
                    onChange={e => canEdit && setSeo({ ...seo, description: e.target.value })} 
                    rows={3}
                    placeholder="Ex: Confira a publicação {title} por {author}."
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border rounded-lg text-sm focus:outline-none transition-colors ${
                      seo.description.length > 140 
                        ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-200 dark:border-neutral-800 focus:ring-2 focus:ring-blue-500'
                    }`} 
                  />
                  {canEdit && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span className="text-[10px] text-gray-400 mr-1 font-medium">Atalhos:</span>
                      {seoVariables.map(v => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setSeo((prev: any) => ({ ...prev, description: (prev.description ? prev.description + ' ' : '') + v.code }))}
                          className="text-[10px] font-mono bg-gray-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-neutral-800 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded transition-colors"
                          title={`Inserir ${v.label}`}
                        >
                          + {v.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Resolved Preview */}
                <div className="mt-3 p-3 bg-gray-50 dark:bg-neutral-950 rounded-xl border border-gray-100 dark:border-neutral-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Prévia no Google (Resultado Final):</span>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate">
                    {resolveTemplateVariables(seo.title || '{title} | {site_name}', { ...formData, _title: title, _slug: slug, _author: author, _summary: summary, _publishDate: publishDate }, collection.name) || 'Título da Publicação'}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate font-mono">
                    https://seusite.com/{slug || 'meu-post'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {resolveTemplateVariables(seo.description || '{summary}', { ...formData, _title: title, _slug: slug, _author: author, _summary: summary, _publishDate: publishDate }, collection.name) || 'Descrição do post aparecerá aqui.'}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageContainer>
  );
}
