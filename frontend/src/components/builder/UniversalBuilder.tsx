'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCollection } from '@/core/schema/actions';
import { 
  Plus, Settings, Trash2, ArrowUp, ArrowDown, 
  ArrowLeft, Copy, Code, Type, Image as ImageIcon, 
  List, MousePointerClick, LayoutTemplate, Package,
  ListChecks, CheckSquare, ToggleLeft, X as XIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';

// ─── Constants ──────────────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'text', label: 'Texto Curto', icon: Type, color: 'blue', description: 'Campo de texto simples em uma linha' },
  { type: 'richText', label: 'Texto Longo', icon: List, color: 'emerald', description: 'Área de texto para múltiplos parágrafos' },
  { type: 'wysiwyg', label: 'Editor Visual', icon: LayoutTemplate, color: 'violet', description: 'Editor de texto com formatação (Negrito, Listas)' },
  { type: 'image', label: 'Imagem', icon: ImageIcon, color: 'amber', description: 'Uma única imagem via URL' },
  { type: 'gallery', label: 'Galeria', icon: ImageIcon, color: 'orange', description: 'Múltiplas imagens em grade' },
  { type: 'table', label: 'Tabela', icon: List, color: 'rose', description: 'Tabela de dados simples' },
  { type: 'button', label: 'Botão', icon: MousePointerClick, color: 'indigo', description: 'Botão com link de redirecionamento' },
  { type: 'select', label: 'Seleção Única', icon: ListChecks, color: 'cyan', description: 'Lista suspensa com uma opção' },
  { type: 'multiselect', label: 'Multi Seleção', icon: CheckSquare, color: 'teal', description: 'Lista com múltiplas escolhas' },
  { type: 'toggle', label: 'Liga/Desliga', icon: ToggleLeft, color: 'lime', description: 'Interruptor verdadeiro ou falso' },
];

const COLOR_MAP: Record<string, string> = {
  text: 'text-blue-500', richText: 'text-emerald-500', wysiwyg: 'text-violet-500',
  image: 'text-amber-500', gallery: 'text-orange-500',
  url: 'text-fuchsia-500', table: 'text-rose-500', button: 'text-indigo-500',
  select: 'text-cyan-500', multiselect: 'text-teal-500', toggle: 'text-lime-500'
};

const BG_MAP: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  cyan: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
  teal: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
  lime: 'bg-lime-50 dark:bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-500/20'
};

const ICON_MAP: Record<string, any> = {
  text: Type, richText: List, wysiwyg: LayoutTemplate,
  image: ImageIcon, gallery: ImageIcon, table: List, button: MousePointerClick,
  select: ListChecks, multiselect: CheckSquare, toggle: ToggleLeft
};

const BADGE_MAP: Record<string, string> = {
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  richText: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  wysiwyg: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
  image: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  gallery: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  table: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  button: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  select: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
  multiselect: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
  toggle: 'bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400'
};

export type AppType = 'publication' | 'page' | 'product';

// ─── Main Component ─────────────────────────────────────────────────────────
export function UniversalBuilder({
  collection,
  backUrl,
  appType = 'publication'
}: {
  collection: any;
  backUrl: string;
  appType?: AppType;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
  const [editingOriginalValue, setEditingOriginalValue] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState(collection.name);

  // Parse metadata
  const initialMeta = (() => {
    try { return collection.metadata ? JSON.parse(collection.metadata) : {}; } catch { return {}; }
  })();

  const [fields, setFields] = useState<any[]>(collection.fields || []);

  // Blueprint toggles for publication features
  const [enableAuthor, setEnableAuthor] = useState(initialMeta.enable_author !== false);
  const [enableSeo, setEnableSeo] = useState(initialMeta.enable_seo !== false);
  const [enableCover, setEnableCover] = useState(initialMeta.enable_cover !== false);
  const [enableStatus, setEnableStatus] = useState(initialMeta.enable_status !== false);
  
  // Specific for products (if needed later to toggle features)
  const [enableSizes, setEnableSizes] = useState(initialMeta.enable_sizes !== false);
  const [enableColors, setEnableColors] = useState(initialMeta.enable_colors !== false);
  
  // Visibility
  const [showInSidebar, setShowInSidebar] = useState(initialMeta.show_in_sidebar === true);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const buildMetadata = (overrides: Record<string, any> = {}) => {
    const currentMeta = (() => {
      try { return collection.metadata ? JSON.parse(collection.metadata) : {}; } catch { return {}; }
    })();
    return JSON.stringify({
      ...currentMeta,
      enable_author: enableAuthor,
      enable_seo: enableSeo,
      enable_cover: enableCover,
      enable_status: enableStatus,
      enable_sizes: enableSizes,
      enable_colors: enableColors,
      show_in_sidebar: showInSidebar,
      ...overrides,
    });
  };

  const saveMetadata = async (overrides: Record<string, any> = {}) => {
    const updatedMeta = buildMetadata(overrides);
    const res = await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: updatedMeta, fields,
    });
    if (res.success) {
      collection.metadata = updatedMeta;
      return true;
    }
    return false;
  };

  // ─── Save Category Blueprint ────────────────────────────────────────────────
  const handleSaveCategory = async () => {
    setIsSubmitting(true);
    const ok = await saveMetadata();
    if (ok) {
      toast.success('Configurações do Esqueleto salvas!');
      router.refresh();
    } else {
      toast.error('Erro ao salvar.');
    }
    setIsSubmitting(false);
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
      name, label, type: blockType, required: false, order: fields.length,
    };
    
    const updatedFields = [...fields, newFieldObj];
    const res = await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: collection.metadata, fields: updatedFields,
    });

    if (res.success) {
      setFields(updatedFields);
      toast.success('Bloco adicionado!');
      setIsAddingField(false);
    } else {
      toast.error('Erro ao adicionar bloco.');
    }
    setIsSubmitting(false);
  };

  // ─── Duplicate Block ──────────────────────────────────────────────────────
  const handleDuplicateField = async (field: any) => {
    setIsSubmitting(true);
    
    let baseLabel = field.label + " Cópia";
    let name = baseLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    
    let counter = 1;
    let label = baseLabel;
    while (fields.some(f => f.name === name)) {
      counter++;
      label = `${baseLabel} ${counter}`;
      name = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    }

    const newFieldObj = { ...field, name, label, order: fields.length };
    const updatedFields = [...fields, newFieldObj];

    const res = await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: collection.metadata, fields: updatedFields,
    });

    if (res.success) {
      setFields(updatedFields);
      toast.success(`Bloco duplicado!`);
    } else {
      toast.error('Erro ao duplicar bloco.');
    }
    setIsSubmitting(false);
  };

  // ─── Update Field Label ───────────────────────────────────────────────────
  const handleUpdateFieldLabel = async (index: number, newLabel: string) => {
    if (!newLabel.trim()) { 
      toast.error('O nome não pode ser vazio.'); 
      const reverted = [...fields];
      reverted[index].label = editingOriginalValue || 'Bloco';
      setFields(reverted);
      return; 
    }
    
    if (editingOriginalValue === newLabel) {
      setEditingOriginalValue(null);
      return;
    }
    
    setIsSubmitting(true);
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], label: newLabel };

    const res = await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: collection.metadata, fields: newFields,
    });

    if (res.success) {
      setFields(newFields);
      toast.success('Nome do bloco atualizado!');
    } else {
      toast.error('Erro ao atualizar nome do bloco.');
    }
    setIsSubmitting(false);
  };

  // ─── Update Field API Name ────────────────────────────────────────────────
  const handleUpdateFieldName = async (index: number, rawNewName: string) => {
    let newName = rawNewName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
    
    if (!newName.trim()) { 
      toast.error('A chave da API não pode ser vazia.'); 
      const reverted = [...fields];
      reverted[index].name = editingOriginalValue || `field_${index}`;
      setFields(reverted);
      return; 
    }
    
    if (editingOriginalValue === newName) {
      const formatted = [...fields];
      formatted[index].name = newName;
      setFields(formatted);
      setEditingOriginalValue(null);
      return; 
    }
    
    setIsSubmitting(true);
    
    if (fields.some((f, i) => i !== index && f.name === newName)) {
      toast.error('Já existe um bloco com essa chave (ID) na API.');
      const reverted = [...fields];
      reverted[index].name = editingOriginalValue || `field_${index}`;
      setFields(reverted);
      setIsSubmitting(false);
      return;
    }

    const newFields = [...fields];
    newFields[index] = { ...newFields[index], name: newName };

    const res = await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: collection.metadata, fields: newFields,
    });

    if (res.success) {
      setFields(newFields);
      setEditingOriginalValue(null);
      toast.success('Chave da API atualizada!');
    } else {
      toast.error('Erro ao atualizar chave da API.');
      const reverted = [...fields];
      reverted[index].name = editingOriginalValue || `field_${index}`;
      setFields(reverted);
    }
    setIsSubmitting(false);
  };


  // ─── Remove Block ─────────────────────────────────────────────────────────
  const confirmRemoveField = async () => {
    if (!fieldToDelete) return;
    setIsSubmitting(true);
    const updatedFields = fields.filter(f => f.name !== fieldToDelete);
    const res = await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: collection.metadata, fields: updatedFields,
    });
    if (res.success) {
      setFields(updatedFields);
      toast.success('Bloco removido!');
      setFieldToDelete(null);
    } else { toast.error('Erro ao remover bloco.'); }
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
    await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: collection.metadata, fields: newFields,
    });
  };

  // ─── Toggle Helper ────────────────────────────────────────────────────────
  const handleToggle = async (key: string, value: boolean, setter: (v: boolean) => void, msgOn: string, msgOff: string) => {
    setter(value);
    const ok = await saveMetadata({ [key]: value });
    if (ok) toast.success(value ? msgOn : msgOff);
    else { setter(!value); toast.error('Erro ao atualizar.'); }
  };

  // ─── Build JSON preview ───────────────────────────────────────────────────
  const buildJsonPreview = () => {
    const base: any = {
      slug: collection.slug,
      fields: fields.map(f => ({ name: f.name, type: f.type, label: f.label })),
    };
    
    if (appType === 'publication') {
      base.enable_author = enableAuthor;
      base.enable_seo = enableSeo;
      base.enable_cover = enableCover;
      base.enable_status = enableStatus;
    } else if (appType === 'product') {
      base.enable_status = enableStatus;
      base.enable_sizes = enableSizes;
      base.enable_colors = enableColors;
      // products have standard fields automatically: sku, price, etc.
    }
    
    return JSON.stringify(base, null, 2);
  };

  // ─── Update Field Options (for select/multiselect) ───────────────────────
  const handleUpdateFieldOptions = async (index: number, options: string[]) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], options };
    setFields(newFields);
    await updateCollection(collection.id, {
      name: collectionName, slug: collection.slug, icon: collection.icon,
      metadata: collection.metadata, fields: newFields,
    });
  };

  // ─── Render field editor ──────────────────────────────────────────────────
  const renderFieldEditor = (field: any, index?: number) => {
    const inputClass = "w-full px-4 py-3 bg-gray-50/50 dark:bg-neutral-950/50 border border-gray-200 dark:border-neutral-800 rounded-xl transition-all text-gray-500 dark:text-neutral-500 cursor-not-allowed italic text-sm text-center flex items-center justify-center";

    switch (field.type) {
      case 'text':
        return <div className={`${inputClass} h-12`}>Campo de texto curto será preenchido pelo usuário.</div>;
      case 'richText':
        return <div className={`${inputClass} h-24`}>Área de texto longo será preenchida pelo usuário.</div>;
      case 'wysiwyg':
        return <div className={`${inputClass} h-32 flex-col`}><LayoutTemplate className="w-5 h-5 mb-2 opacity-50"/>Editor visual (WYSIWYG) será preenchido pelo usuário.</div>;
      case 'image':
        return <div className={`${inputClass} h-24 flex-col`}><ImageIcon className="w-5 h-5 mb-2 opacity-50"/> Imagem será preenchida pelo usuário.</div>;
      case 'gallery':
        return <div className={`${inputClass} h-24 flex-col`}><ImageIcon className="w-5 h-5 mb-2 opacity-50"/> Galeria de Imagens será preenchida pelo usuário.</div>;
      case 'url':
        return <div className={`${inputClass} h-12`}>URL de destino será preenchida pelo usuário.</div>;
      case 'table':
        return <div className={`${inputClass} h-24 flex-col`}><List className="w-5 h-5 mb-2 opacity-50"/> Tabela será preenchida pelo usuário.</div>;
      case 'button':
        return <div className={`${inputClass} h-16 flex-col`}><MousePointerClick className="w-5 h-5 mb-1 opacity-50"/>Botão será preenchido pelo usuário.</div>;

      case 'toggle':
        return (
          <div className="flex items-center gap-4 px-4 py-3 bg-gray-50/50 dark:bg-neutral-950/50 border border-gray-200 dark:border-neutral-800 rounded-xl">
            <div className="w-10 h-5 bg-gray-300 dark:bg-neutral-700 rounded-full relative opacity-60">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </div>
            <span className="text-sm text-gray-400 dark:text-neutral-500 italic">O usuário poderá ligar ou desligar esta opção.</span>
          </div>
        );

      case 'select':
      case 'multiselect': {
        const opts: string[] = field.options || [];
        const isMulti = field.type === 'multiselect';
        return (
          <div className="space-y-3">
            {/* Preview das opções */}
            {opts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {opts.map((opt, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                    isMulti
                      ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20'
                      : 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20'
                  }`}>
                    {isMulti ? <CheckSquare className="w-3 h-3" /> : <ListChecks className="w-3 h-3" />}
                    {opt}
                    {index !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleUpdateFieldOptions(index, opts.filter((_, j) => j !== i))}
                        className="hover:opacity-70 ml-0.5"
                      >
                        <XIcon className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Input para adicionar opção */}
            {index !== undefined && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nova opção... (Enter para adicionar)"
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-teal-500 text-gray-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val && !opts.includes(val)) {
                        handleUpdateFieldOptions(index, [...opts, val]);
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            )}

            {opts.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">
                {isMulti ? 'Multi seleção' : 'Seleção única'} — adicione as opções acima (Enter para confirmar).
              </p>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ─── Render Side Settings based on AppType ────────────────────────────────
  const renderSideSettings = () => {
    if (appType === 'publication') {
      return (
        <>
          <div className="flex items-center justify-between">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Status/Agendamento</span><span className="block text-xs text-gray-500 dark:text-gray-400">Ativa Publicado, Rascunho, Data</span></div>
            <button 
              onClick={() => handleToggle('enable_status', !enableStatus, setEnableStatus, 'Status ativado!', 'Status desativado.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${enableStatus ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableStatus ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Autor</span><span className="block text-xs text-gray-500 dark:text-gray-400">Ativa o campo de autor</span></div>
            <button 
              onClick={() => handleToggle('enable_author', !enableAuthor, setEnableAuthor, 'Autor ativado!', 'Autor desativado.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${enableAuthor ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableAuthor ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Configurações SEO</span><span className="block text-xs text-gray-500 dark:text-gray-400">Title, Description, etc.</span></div>
            <button 
              onClick={() => handleToggle('enable_seo', !enableSeo, setEnableSeo, 'SEO ativado!', 'SEO desativado.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${enableSeo ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableSeo ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Imagem de Capa</span><span className="block text-xs text-gray-500 dark:text-gray-400">Ativa upload de capa</span></div>
            <button 
              onClick={() => handleToggle('enable_cover', !enableCover, setEnableCover, 'Capa ativada!', 'Capa desativada.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${enableCover ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableCover ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800 mt-4">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Exibir no Menu Lateral</span><span className="block text-xs text-gray-500 dark:text-gray-400">Fixar atalho direto no Sidebar</span></div>
            <button 
              onClick={() => handleToggle('show_in_sidebar', !showInSidebar, setShowInSidebar, 'Adicionado ao menu lateral!', 'Removido do menu lateral.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${showInSidebar ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showInSidebar ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </>
      );
    } else if (appType === 'product') {
      return (
        <>
          <div className="flex items-center justify-between">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Status/Estoque</span><span className="block text-xs text-gray-500 dark:text-gray-400">Ativa Disponível, Esgotado</span></div>
            <button 
              onClick={() => handleToggle('enable_status', !enableStatus, setEnableStatus, 'Status ativado!', 'Status desativado.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${enableStatus ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableStatus ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Variações de Tamanho</span><span className="block text-xs text-gray-500 dark:text-gray-400">Permitir escolher P, M, G, etc.</span></div>
            <button 
              onClick={() => handleToggle('enable_sizes', !enableSizes, setEnableSizes, 'Tamanhos ativados!', 'Tamanhos desativados.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${enableSizes ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableSizes ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Variações de Cor</span><span className="block text-xs text-gray-500 dark:text-gray-400">Permitir escolher cores do item.</span></div>
            <button 
              onClick={() => handleToggle('enable_colors', !enableColors, setEnableColors, 'Cores ativadas!', 'Cores desativadas.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${enableColors ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableColors ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800 mt-4">
            <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Exibir no Menu Lateral</span><span className="block text-xs text-gray-500 dark:text-gray-400">Fixar atalho direto no Sidebar</span></div>
            <button 
              onClick={() => handleToggle('show_in_sidebar', !showInSidebar, setShowInSidebar, 'Adicionado ao menu lateral!', 'Removido do menu lateral.')}
              className={`w-10 h-5 rounded-full relative transition-colors ${showInSidebar ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showInSidebar ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-emerald-500/10 text-blue-800 dark:text-emerald-400 rounded-lg text-xs mt-2 border border-blue-100 dark:border-emerald-900/50">
            <strong>Nota:</strong> Campos básicos como SKU, Preço, Tipo, Peso e Imagem Principal já são incluídos por padrão em todos os produtos. Adicione blocos ao lado apenas para informações extras (ex: Tabela Nutricional, Ficha Técnica, etc).
          </div>
        </>
      );
    }
    
    // default/page
    return (
       <div className="flex items-center justify-between">
        <div><span className="block text-sm font-medium text-gray-900 dark:text-white">Status/Agendamento</span><span className="block text-xs text-gray-500 dark:text-gray-400">Ativa Publicado, Rascunho</span></div>
        <button 
          onClick={() => handleToggle('enable_status', !enableStatus, setEnableStatus, 'Status ativado!', 'Status desativado.')}
          className={`w-10 h-5 rounded-full relative transition-colors ${enableStatus ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableStatus ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0 w-full">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button onClick={() => router.push(backUrl)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1 pr-8 lg:pr-24">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2 break-words min-w-0">{collectionName}</h1>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                Construtor de Esqueleto
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure a estrutura de blocos e campos padrão.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveCategory} disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ─── EDITOR (left 2/3) ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {fields.length === 0 ? (
            <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-emerald-500/10 text-blue-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Estrutura Vazia</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">Adicione blocos ao lado para definir o esqueleto que todos os itens terão.</p>
            </div>
          ) : (
            fields.map((field, index) => {
              const FieldIcon = ICON_MAP[field.type] || Type;
              return (
                <div key={index} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-sm transition-all hover:border-blue-300 dark:hover:border-emerald-500/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2 flex-1 w-full max-w-sm">
                      <FieldIcon className={`w-4 h-4 shrink-0 ${COLOR_MAP[field.type] || 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={field.label}
                        onFocus={() => setEditingOriginalValue(field.label)}
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
                          onFocus={() => setEditingOriginalValue(field.name)}
                          onChange={(e) => {
                            const newFields = [...fields];
                            const sanitized = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_');
                            newFields[index] = { ...newFields[index], name: sanitized };
                            setFields(newFields);
                          }}
                          onBlur={(e) => handleUpdateFieldName(index, e.target.value)}
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
                  {renderFieldEditor(field, index)}
                </div>
              );
            })
          )}
        </div>

        {/* ─── SIDEBAR (right 1/3) ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* ADD BLOCK */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-neutral-800">
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
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-400" /> Configurações Gerais</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Nome da Categoria</label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  onBlur={handleSaveCategory}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                {renderSideSettings()}
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-4">Estas opções habilitam/desabilitam funcionalidades no painel lateral na hora da criação do item.</p>
          </div>

          {/* API PREVIEW */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Code className="w-4 h-4 text-violet-500" /> API & Estrutura</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Esqueleto JSON</label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { navigator.clipboard.writeText(buildJsonPreview()); toast.success('JSON copiado!'); }}
                      className="p-1.5 text-gray-400 hover:text-violet-500 rounded-md transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <pre className="mt-1 text-xs bg-gray-50 dark:bg-neutral-950 text-gray-700 dark:text-gray-300 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 font-mono overflow-x-auto max-h-64 overflow-y-auto">
                  {buildJsonPreview()}
                </pre>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Campos</label>
                <div className="space-y-1 mt-1">
                  {fields.length === 0 ? <p className="text-xs text-gray-400 italic">Nenhum campo criado.</p> : fields.map((f, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-neutral-950 rounded-lg border border-gray-100 dark:border-neutral-800">
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300">{f.name}</code>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE_MAP[f.type] || BADGE_MAP.text}`}>{f.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {fieldToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Excluir Bloco?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remover <strong className="text-gray-700 dark:text-gray-300">"{fields.find(f => f.name === fieldToDelete)?.label || fieldToDelete}"</strong> permanentemente do modelo?
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
        </div>
      )}
    </PageContainer>
  );
}
