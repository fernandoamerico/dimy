'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateDocument } from '@/core/content/actions';
import { updateCollection } from '@/core/schema/actions';
import {
  ArrowLeft, Save, Plus, Settings,
  Trash2, Code, Copy, Check, ChevronDown, ChevronUp, ArrowUp, ArrowDown,
  FileEdit, Search, Paintbrush, FileCode, Power, Globe, ImagePlus
} from 'lucide-react';
import { BLOCK_TYPES, COLOR_MAP, BG_MAP, ICON_MAP, BADGE_MAP } from '@/core/blocks/BlockRegistry';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { GalleryBlockEditor } from '@/components/ui/GalleryBlockEditor';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { toast } from 'sonner';

const GOOGLE_FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Outfit', 'Nunito', 'Oswald', 'Source Sans 3', 'Playfair Display'];

// ─── Toggle Component ───────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-emerald-500"></div>
    </label>
  );
}

// ─── Collapsible Panel ──────────────────────────────────────────────────────
function Panel({ title, icon: Icon, iconColor, children, defaultOpen = true }: { title: string, icon: any, iconColor?: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl dark:shadow-sm dark:border dark:border-neutral-800 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} /> {title}
        </h2>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function PageBuilder({
  collection,
  document: pageDoc
}: {
  collection: any;
  document: any;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Parse metadata
  const initialMeta = (() => {
    try { return collection.metadata ? JSON.parse(collection.metadata) : {}; } catch { return {}; }
  })();

  const [collectionName, setCollectionName] = useState(collection.name);
  const [collectionSlug, setCollectionSlug] = useState(collection.slug);

  const [formData, setFormData] = useState<Record<string, any>>(pageDoc?.data || {});
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo'>('content');

  const [galleryLibraryOpenFor, setGalleryLibraryOpenFor] = useState<string | null>(null);

  const [fields, setFields] = useState<any[]>(() => {
    const initialFields = pageDoc?.data?._fields || collection.fields || [];
    return initialFields.map((f: any) => ({ ...f, _id: f._id || Math.random().toString(36).substring(2, 9) }));
  });

  // Metadata states
  const [showInSidebar, setShowInSidebar] = useState(!!initialMeta.show_in_sidebar);
  const [isActive, setIsActive] = useState(initialMeta.is_active !== false);
  const [isPublic, setIsPublic] = useState(initialMeta.is_public !== false);

  // SEO
  const [seo, setSeo] = useState(initialMeta.seo || { title: '', description: '', keywords: '', canonical: '' });

  // Cover
  const [cover, setCover] = useState(initialMeta.cover || { image: '', alt: '' });

  // CSS
  const [css, setCss] = useState(initialMeta.css || { font: '', textColor: '', bgColor: '', margin: '', padding: '' });
  const [customCss, setCustomCss] = useState(initialMeta.customCss || '');

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const buildMetadata = (overrides: Record<string, any> = {}) => {
    const currentMeta = (() => {
      try { return collection.metadata ? JSON.parse(collection.metadata) : {}; } catch { return {}; }
    })();
    return JSON.stringify({
      ...currentMeta,
      show_in_sidebar: showInSidebar,
      is_active: isActive,
      is_public: isPublic,
      seo, cover, css, customCss,
      ...overrides,
    });
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // ─── Save Page ────────────────────────────────────────────────────────────
  const handleSavePage = async (mode: 'draft' | 'publish') => {
    setIsSubmitting(true);
    setSavingMode(mode);

    const newStatus = mode === 'publish' ? 'published' : 'draft';
    
    // Prune formData to only include keys from active fields, plus base properties
    const prunedData: Record<string, any> = { 
      _fields: fields,
      title: formData.title,
      slug: formData.slug,
      status: newStatus,
      css, customCss
    };
    
    fields.forEach(f => {
      if (formData[f.name] !== undefined) {
        prunedData[f.name] = formData[f.name];
      }
    });

    // Update local formData status to reflect the saved value
    setFormData(prev => ({ ...prev, status: newStatus }));

    // Save document data
    const result = await updateDocument(pageDoc.id, collection.slug, prunedData);
    if (result.success) {
      toast.success(mode === 'publish' ? 'Seção publicada com sucesso!' : 'Rascunho salvo com sucesso!');
      router.refresh();
    } else {
      toast.error('Erro ao salvar: ' + result.error);
    }
    setIsSubmitting(false);
    setSavingMode(null);
  };

  // ─── Add Block ────────────────────────────────────────────────────────────
  const handleAddBlock = async (blockType: string, baseLabel: string) => {
    setIsSubmitting(true);
    
    // Auto-generate a unique label and name
    let label = baseLabel;
    let name = baseLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    
    let counter = 1;
    while (fields.some(f => f.name === name)) {
      counter++;
      label = `${baseLabel} ${counter}`;
      name = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    }

    const newFieldObj = {
      _id: Math.random().toString(36).substring(2, 9),
      name, label, type: blockType, required: false, order: fields.length,
    };
    
    const updatedFields = [...fields, newFieldObj];
    setFields(updatedFields);
    setIsSubmitting(false);
  };

  // ─── Duplicate Block ──────────────────────────────────────────────────────
  const handleDuplicateField = async (field: any) => {
    setIsSubmitting(true);
    
    const baseLabel = `${field.label} (Cópia)`;
    let label = baseLabel;
    let name = baseLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    
    let counter = 1;
    while (fields.some(f => f.name === name)) {
      counter++;
      label = `${baseLabel} ${counter}`;
      name = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    }

    const newFieldObj = { ...field, _id: Math.random().toString(36).substring(2, 9), name, label, order: fields.length };
    const updatedFields = [...fields, newFieldObj];
    
    setFields(updatedFields);
    // Copy data as well
    if (formData[field.name] !== undefined) {
      setFormData(prev => ({ ...prev, [name]: prev[field.name] }));
    }
    setIsSubmitting(false);
  };

  // ─── Update Field Label ───────────────────────────────────────────────────
  const handleUpdateFieldLabel = async (index: number, newLabel: string) => {
    if (!newLabel.trim() || fields[index].label === newLabel) return;
    
    setIsSubmitting(true);
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], label: newLabel };

    setFields(newFields);
    setIsSubmitting(false);
  };

  // ─── Update Field API Name ────────────────────────────────────────────────
  const handleUpdateFieldName = (index: number, rawNewName: string) => {
    let newName = rawNewName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    
    const oldName = fields[index].name;
    if (oldName === newName) return;
    
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], name: newName };

    setFields(newFields);
    // Migrate formData key
    if (formData[oldName] !== undefined) {
      setFormData(prev => {
        const newData = { ...prev };
        newData[newName] = newData[oldName];
        delete newData[oldName];
        return newData;
      });
    }
  };


  // ─── Remove Block ─────────────────────────────────────────────────────────
  const confirmRemoveField = async () => {
    if (!fieldToDelete) return;
    setIsSubmitting(true);
    const updatedFields = fields.filter(f => f.name !== fieldToDelete);
    setFields(updatedFields);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData[fieldToDelete];
      return newData;
    });
    toast.success('Bloco removido!');
    setFieldToDelete(null);
    setIsSubmitting(false);
  };

  // ─── Reorder ──────────────────────────────────────────────────────────────
  const moveField = async (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newFields.length) return;
    [newFields[index], newFields[swapIdx]] = [newFields[swapIdx], newFields[index]];
    newFields.forEach((f, i) => f.order = i);
    setFields(newFields);
  };


  // ─── Build JSON preview ───────────────────────────────────────────────────
  const buildJsonPreview = () => JSON.stringify({
    slug: collection.slug, is_active: isActive, is_public: isPublic,
    seo, cover, css, customCss: customCss || undefined,
    fields: fields.map(f => ({ name: f.name, type: f.type, label: f.label })),
    data: Object.fromEntries(fields.map(f => [f.name, formData[f.name] || null])),
  }, null, 2);

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

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0 w-full">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href={`/paginas/list?slug=${collection.slug}`} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1 pr-8 lg:pr-24">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2 break-words min-w-0">{collectionName}</h1>
              {!isActive && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  Desativada
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">Page Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSavePage('draft')}
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
            onClick={() => handleSavePage('publish')}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── EDITOR AREA (left 2/3) ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {fields.length === 0 ? (
            <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-emerald-500/10 text-blue-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Página em branco</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">Adicione o primeiro bloco ao lado para começar a estruturar sua página.</p>
            </div>
          ) : (
            fields.map((field, index) => {
              const FieldIcon = ICON_MAP[field.type] || Type;
              return (
                <div key={field._id} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md dark:border dark:border-neutral-800 rounded-2xl p-5 dark:shadow-sm transition-all hover:border-blue-300 dark:hover:border-emerald-500/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2 flex-1 w-full max-w-sm">
                      <FieldIcon className={`w-4 h-4 shrink-0 ${COLOR_MAP[field.type] || 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...fields];
                          newFields[index] = { ...newFields[index], label: e.target.value };
                          setFields(newFields);
                        }}
                        onBlur={(e) => handleUpdateFieldLabel(index, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-neutral-700 focus:border-blue-500 dark:focus:border-emerald-500 focus:outline-none text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide px-1 py-0.5 transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="relative group hidden md:flex items-center">
                        <span className="text-[10px] font-bold text-gray-400 absolute left-2 pointer-events-none">ID:</span>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => handleUpdateFieldName(index, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                          className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 px-2 py-0.5 pl-6 rounded-md font-mono w-24 sm:w-32 focus:w-40 transition-all border border-transparent hover:border-gray-300 dark:hover:border-neutral-600 focus:border-violet-500 focus:outline-none focus:bg-white dark:focus:bg-neutral-900"
                          title="Chave do JSON (API)"
                        />
                      </div>
                      <button onClick={() => handleDuplicateField(field)} disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-emerald-400 disabled:opacity-30 rounded transition-colors" title="Duplicar bloco"><Copy className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800 mx-1 hidden sm:block"></div>
                      <button onClick={() => moveField(index, 'up')} disabled={index === 0}
                        className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-emerald-400 disabled:opacity-30 rounded transition-colors" title="Mover para cima"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1}
                        className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-emerald-400 disabled:opacity-30 rounded transition-colors" title="Mover para baixo"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setFieldToDelete(field.name)} disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors disabled:opacity-50" title="Remover bloco"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {renderFieldEditor(field)}
                </div>
              );
            })
          )}
        </div>

        {/* ─── SIDEBAR (right 1/3) ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* ADD BLOCK */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500 dark:text-emerald-400" /> Adicionar Bloco
            </h2>

            {!isAddingField ? (
              <button onClick={() => setIsAddingField(true)}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl text-gray-600 dark:text-neutral-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Novo Bloco
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-2 gap-2">
                  {BLOCK_TYPES.map(bt => {
                    const BtIcon = bt.icon;
                    return (
                      <button key={bt.type} onClick={() => handleAddBlock(bt.type, bt.label)} disabled={isSubmitting}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ${BG_MAP[bt.color]}`}>
                        <BtIcon className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold leading-tight">{bt.label}</span>
                          <span className="block text-[10px] opacity-70 leading-tight mt-0.5">{bt.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setIsAddingField(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2 transition-colors">Cancelar</button>
              </div>
            )}
          </div>

          {/* SETTINGS */}
          <Panel title="Configurações da Seção" icon={Settings} iconColor="text-gray-400" defaultOpen>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Título da Seção</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={() => handleSavePage('draft')}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">ID / Slug Interno</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => {
                    const formatted = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\-]+/g, '-');
                    handleChange('slug', formatted);
                  }}
                  onBlur={() => handleSavePage('draft')}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors font-mono"
                />
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Seção Ativa</span><span className="block text-xs text-gray-500 dark:text-gray-400">Exibir seção no site</span></div>
                  <Toggle checked={formData.status === 'published'} onChange={v => {
                    handleChange('status', v ? 'published' : 'draft');
                  }} />
                </div>
              </div>
            </div>
          </Panel>



          {/* CSS BASIC */}
          <Panel title="CSS Básico" icon={Paintbrush} iconColor="text-cyan-500">
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Fonte</label>
                <select value={css.font} onChange={e => setCss({ ...css, font: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white">
                  {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Cor do Texto</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={css.textColor} onChange={e => setCss({ ...css, textColor: e.target.value })} className="w-8 h-8 rounded-md border border-gray-200 dark:border-neutral-800 cursor-pointer" />
                    <input type="text" value={css.textColor} onChange={e => setCss({ ...css, textColor: e.target.value })} className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-md text-xs font-mono text-gray-900 dark:text-white" />
                  </div></div>
                <div><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Cor de Fundo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={css.bgColor} onChange={e => setCss({ ...css, bgColor: e.target.value })} className="w-8 h-8 rounded-md border border-gray-200 dark:border-neutral-800 cursor-pointer" />
                    <input type="text" value={css.bgColor} onChange={e => setCss({ ...css, bgColor: e.target.value })} className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-md text-xs font-mono text-gray-900 dark:text-white" />
                  </div></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Margin</label>
                  <input type="text" value={css.margin} onChange={e => setCss({ ...css, margin: e.target.value })} placeholder="0"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm font-mono text-gray-900 dark:text-white" /></div>
                <div><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Padding</label>
                  <input type="text" value={css.padding} onChange={e => setCss({ ...css, padding: e.target.value })} placeholder="20px"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm font-mono text-gray-900 dark:text-white" /></div>
              </div>
            </div>
          </Panel>

          {/* CUSTOM CSS */}
          <Panel title="CSS Personalizado" icon={FileCode} iconColor="text-violet-500">
            <textarea value={customCss} onChange={e => setCustomCss(e.target.value)} rows={8}
              placeholder={`.minha-pagina {\n  background: linear-gradient(...);\n  border-radius: 12px;\n}`}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white font-mono text-xs resize-y" />
            <p className="text-[10px] text-gray-400 dark:text-neutral-500">O CSS será incluído no JSON da API para uso no frontend.</p>
          </Panel>

          {/* API PREVIEW */}
          <Panel title="API & Estrutura" icon={Code} iconColor="text-violet-500">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Endpoint</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-gray-50 dark:bg-neutral-950 text-violet-600 dark:text-violet-400 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 font-mono truncate">/api/content/{collection.slug}</code>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/content/${collection.slug}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors shrink-0">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">JSON</label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { navigator.clipboard.writeText(buildJsonPreview()); toast.success('JSON copiado!'); }}
                      className="p-1.5 text-gray-400 hover:text-violet-500 rounded-md transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { const b = new Blob([buildJsonPreview()], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${collection.slug}.json`; a.click(); URL.revokeObjectURL(u); toast.success('JSON baixado!'); }}
                      className="p-1.5 text-gray-400 hover:text-violet-500 rounded-md transition-colors"><ArrowLeft className="w-3.5 h-3.5 -rotate-90" /></button>
                  </div>
                </div>
                <pre className="mt-1 text-xs bg-gray-50 dark:bg-neutral-950 text-gray-700 dark:text-gray-300 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 font-mono overflow-x-auto max-h-64 overflow-y-auto">
                  {buildJsonPreview()}
                </pre>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Campos</label>
                <div className="space-y-1 mt-1">
                  {fields.length === 0 ? <p className="text-xs text-gray-400 italic">Nenhum campo criado.</p> : fields.map(f => (
                    <div key={f.name} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-neutral-950 rounded-lg border border-gray-100 dark:border-neutral-800">
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300">{f.name}</code>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE_MAP[f.type] || BADGE_MAP.text}`}>{f.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {fieldToDelete && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Excluir Bloco?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remover <strong className="text-gray-700 dark:text-gray-300">"{fields.find(f => f.name === fieldToDelete)?.label || fieldToDelete}"</strong> permanentemente?
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setFieldToDelete(null)} disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50">Cancelar</button>
              <button onClick={confirmRemoveField} disabled={isSubmitting} autoFocus
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900">
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageContainer>
  );
}
