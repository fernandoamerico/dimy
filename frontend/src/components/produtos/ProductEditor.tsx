'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateDocument, createDocument } from '@/core/content/actions';
import { PageContainer } from '@/components/layout/PageContainer';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { GalleryBlockEditor } from '@/components/ui/GalleryBlockEditor';
import { WysiwygEditor } from '@/components/ui/WysiwygEditor';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { TagSelector } from '@/components/ui/TagSelector';
import { toast } from 'sonner';
import {
  ArrowLeft, Image as ImageIcon, List, MousePointerClick,
  Save, Trash2, Plus, Settings, DollarSign, Barcode, Scale,
  Layers, ChevronDown, GripVertical, X, AlertCircle, CheckSquare, ListChecks, ToggleLeft, Library, Copy, Star, Award, ThumbsUp
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Variant {
  id: string;
  name: string;
  price: string;
  description?: string;
  sku?: string;
  isBestSeller?: boolean;
  isRecommended?: boolean;
  isFeatured?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function genId() { return Math.random().toString(36).slice(2, 9); }

function formatBRL(val: string | number) {
  const n = parseFloat(String(val));
  if (isNaN(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ProductEditor({
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

  const [formData, setFormData] = useState<Record<string, any>>(document?.data || {});
  const [galleryLibraryOpenFor, setGalleryLibraryOpenFor] = useState<string | null>(null);

  // Basic fields
  const [title, setTitle] = useState(formData._title || '');
  const [sku, setSku] = useState(formData._sku || '');
  const [price, setPrice] = useState(formData._price || '');
  const [discountPrice, setDiscountPrice] = useState(formData._discountPrice || '');
  const [weight, setWeight] = useState(formData._weight || '');
  const [productType, setProductType] = useState(formData._productType || 'fisico');
  const [status, setStatus] = useState<'available' | 'out_of_stock'>(formData._status || 'available');
  const [sizes, setSizes] = useState<string[]>(formData._sizes || []);
  const [colors, setColors] = useState<string[]>(formData._colors || []);
  const [mainImage, setMainImage] = useState(formData._mainImage || '');

  // Variants
  const [hasVariants, setHasVariants] = useState<boolean>(formData._hasVariants ?? false);
  const [variants, setVariants] = useState<Variant[]>(formData._variants || []);

  const fields = collection.fields || [];
  const meta = (() => {
    try { return collection.metadata ? JSON.parse(collection.metadata) : {}; } catch { return {}; }
  })();

  // ─── Variant helpers ───────────────────────────────────────────────────────
  const priceRange = useMemo(() => {
    if (!hasVariants || variants.length === 0) return null;
    const prices = variants.map(v => parseFloat(v.price)).filter(p => !isNaN(p));
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, same: min === max };
  }, [hasVariants, variants]);

  const addVariant = () => {
    setVariants(prev => [...prev, { id: genId(), name: '', price: '', description: '', sku: '' }]);
  };

  const updateVariant = (id: string, key: keyof Variant, value: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [key]: value } : v));
  };

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const duplicateVariant = (id: string) => {
    const variantToCopy = variants.find(v => v.id === id);
    if (!variantToCopy) return;
    const newVariant = { 
      ...variantToCopy, 
      id: genId(), 
      name: `${variantToCopy.name} (Cópia)` 
    };
    const index = variants.findIndex(v => v.id === id);
    setVariants(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newVariant);
      return copy;
    });
  };

  const toggleVariants = (enable: boolean) => {
    setHasVariants(enable);
    if (!enable) setVariants([]);
  };

  // ─── Field change ──────────────────────────────────────────────────────────
  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { toast.error('O nome do produto é obrigatório.'); return; }

    // Validação de variantes
    if (hasVariants) {
      if (variants.length === 0) { toast.error('Adicione ao menos uma variante ou desative as variantes.'); return; }
      const invalid = variants.some(v => !v.name.trim() || !v.price.trim());
      if (invalid) { toast.error('Preencha o nome e o preço de todas as variantes.'); return; }
    } else {
      if (!price.trim()) { toast.error('O preço do produto é obrigatório.'); return; }
    }

    setIsSubmitting(true);

    // Preço base = menor variante ou preço fixo
    const basePrice = hasVariants && priceRange ? String(priceRange.min) : price;

    const dataToSave = {
      ...formData,
      _title: title,
      _sku: sku,
      _price: basePrice,
      _discountPrice: discountPrice,
      _weight: weight,
      _productType: productType,
      _status: status,
      _sizes: sizes,
      _colors: colors,
      _mainImage: mainImage,
      _hasVariants: hasVariants,
      _variants: hasVariants ? variants : [],
    };

    if (isNew) {
      const res = await createDocument(collection.id, collection.slug, dataToSave);
      if (res.success) {
        toast.success('Produto criado!');
        router.push(`/produtos/lista?slug=${collection.slug}`);
        router.refresh();
      } else { toast.error(res.error || 'Erro ao criar produto.'); }
    } else {
      const res = await updateDocument(document.id, collection.slug, dataToSave);
      if (res.success) { toast.success('Produto salvo!'); router.refresh(); }
      else { toast.error(res.error || 'Erro ao salvar produto.'); }
    }

    setIsSubmitting(false);
  };

  // ─── Render extra field editor ─────────────────────────────────────────────
  const renderFieldEditor = (field: any) => {
    const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white";

    switch (field.type) {
      case 'text':
        return <input type="text" value={formData[field.name] || ''} onChange={e => handleChange(field.name, e.target.value)}
          placeholder={`Digite ${field.label.toLowerCase()}...`} className={inputClass} />;

      case 'richText':
        return <textarea value={formData[field.name] || ''} onChange={e => handleChange(field.name, e.target.value)}
          placeholder={`Escreva...`} rows={6} className={`${inputClass} resize-y`} />;

      case 'wysiwyg':
        return <WysiwygEditor value={formData[field.name] || ''} onChange={val => handleChange(field.name, val)} />;

      case 'image':
        return (
          <div className="space-y-3">
            <ImageUploader value={formData[field.name] || ''} onChange={url => handleChange(field.name, url)} placeholder="URL ou Upload" />
          </div>
        );

      case 'gallery': {
        const rawVal = formData[field.name];
        const galleryVal: string[] = Array.isArray(rawVal) ? rawVal : [];
        return (
          <GalleryBlockEditor
            urls={galleryVal}
            onChange={(urls) => handleChange(field.name, urls)}
          />
        );
      }

      case 'url':
        const urlVal = typeof formData[field.name] === 'string' ? formData[field.name] : '';
        return <input type="url" value={urlVal} onChange={e => handleChange(field.name, e.target.value)} placeholder="https://..." className={inputClass} />;

      case 'table': {
        const rawVal = formData[field.name];
        const tableVal: string[][] = Array.isArray(rawVal) ? rawVal : [['', ''], ['', '']];
        return (
          <div className="space-y-3">
            <div className="border border-gray-300 dark:border-neutral-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {tableVal.map((row: string[], ri: number) => (
                    <tr key={ri} className="border-b border-gray-300 dark:border-neutral-700 last:border-b-0">
                      {row.map((col: string, ci: number) => (
                        <td key={ci} className="p-0 border-r border-gray-300 dark:border-neutral-700 last:border-r-0">
                          <input type="text" value={col} onChange={e => { const t = tableVal.map((r: string[]) => [...r]); t[ri]![ci] = e.target.value; handleChange(field.name, t); }} className="w-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50/50 dark:focus:bg-emerald-500/10 text-gray-900 dark:text-white text-sm" />
                        </td>
                      ))}
                      <td className="p-1 w-10 text-center"><button onClick={() => { if (tableVal.length > 1) handleChange(field.name, tableVal.filter((_: any, i: number) => i !== ri)); }} className="p-1 text-red-400 hover:text-red-600 rounded disabled:opacity-30" disabled={tableVal.length <= 1}><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleChange(field.name, [...tableVal, new Array(tableVal[0]?.length || 2).fill('')])} className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline">+ Linha</button>
              <button onClick={() => handleChange(field.name, tableVal.map((r: string[]) => [...r, '']))} className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline">+ Coluna</button>
            </div>
          </div>
        );
      }

      case 'button': {
        const rawVal = formData[field.name];
        const btnVal = (typeof rawVal === 'object' && rawVal !== null && !Array.isArray(rawVal)) ? rawVal : { label: '', url: '' };
        return (
          <div className="flex items-center gap-3">
            <input type="text" value={btnVal.label} onChange={e => handleChange(field.name, { ...btnVal, label: e.target.value })} placeholder="Texto do Botão" className={inputClass} />
            <input type="url" value={btnVal.url} onChange={e => handleChange(field.name, { ...btnVal, url: e.target.value })} placeholder="URL de Destino" className={inputClass} />
          </div>
        );
      }

      case 'toggle': {
        const rawVal = formData[field.name];
        const togVal = typeof rawVal === 'boolean' ? rawVal : false;
        return (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => handleChange(field.name, !togVal)}
              className={`w-12 h-6 rounded-full relative transition-colors ${togVal ? 'bg-lime-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${togVal ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">{togVal ? 'Ligado' : 'Desligado'}</span>
          </div>
        );
      }

      case 'select': {
        const opts: string[] = field.options || [];
        const rawVal = formData[field.name];
        const selVal = typeof rawVal === 'string' ? rawVal : '';
        return (
          <select value={selVal} onChange={e => handleChange(field.name, e.target.value)} className={`${inputClass} cursor-pointer`}>
            <option value="">Selecione uma opção...</option>
            {opts.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }

      case 'multiselect': {
        const opts: string[] = field.options || [];
        const rawVal = formData[field.name];
        const multiVal: string[] = Array.isArray(rawVal) ? rawVal : [];
        const toggleOpt = (opt: string) => {
          handleChange(field.name, multiVal.includes(opt) ? multiVal.filter((v: string) => v !== opt) : [...multiVal, opt]);
        };
        return (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl min-h-[48px]">
            {opts.length === 0 && <span className="text-sm text-gray-400 italic">Nenhuma opção definida no esqueleto.</span>}
            {opts.map((opt: string) => (
              <button key={opt} type="button" onClick={() => toggleOpt(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${multiVal.includes(opt) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-teal-400'}`}>
                {opt}
              </button>
            ))}
          </div>
        );
      }

      default: return null;
    }
  };

  // ─── Input style shared ────────────────────────────────────────────────────
  const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white";

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/produtos/lista?slug=${collection.slug}`} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isNew ? 'Novo Produto' : 'Editar Produto'}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                {collection.name}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Preencha as informações do produto e blocos extras.</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ─── EDITOR (left 2/3) ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Informações básicas */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Nome do Produto *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Pacote Consultoria, Camiseta Básica..."
                className={`${inputCls} text-lg font-medium`} />
            </div>

            {/* SKU + Peso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2 flex items-center gap-2"><Barcode className="w-4 h-4 text-gray-400" /> SKU</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="Ex: SRV-001" className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2 flex items-center gap-2"><Scale className="w-4 h-4 text-gray-400" /> Peso (kg)</label>
                <input type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 0.5" className={inputCls} />
              </div>
            </div>

            {/* Imagem Principal */}
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Imagem Principal</label>
              <div className="space-y-3">
                <ImageUploader value={mainImage} onChange={setMainImage} placeholder="URL ou Upload da Imagem Principal" />
              </div>
            </div>
          </div>

          {/* ─── Preço / Variantes ───────────────────────────────────────── */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl dark:shadow-sm dark:border dark:border-neutral-800 overflow-hidden">
            {/* Header da seção de preço */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {hasVariants ? 'Variantes de Preço' : 'Preço'}
                </h3>
                {hasVariants && priceRange && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    {priceRange.same
                      ? formatBRL(priceRange.min)
                      : `${formatBRL(priceRange.min)} — ${formatBRL(priceRange.max)}`}
                  </span>
                )}
              </div>
              {/* Toggle "Tem variantes?" */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">Variantes de preço</span>
                <button
                  type="button"
                  onClick={() => toggleVariants(!hasVariants)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${hasVariants ? 'bg-blue-500 dark:bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasVariants ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {!hasVariants ? (
                /* Preço simples */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Preço *</label>
                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Preço Promocional</label>
                    <input type="number" step="0.01" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="0.00" className={inputCls} />
                  </div>
                </div>
              ) : (
                /* Variantes */
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                    <Layers className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      Cada variante é uma modalidade independente com seu próprio preço. No front-end, o produto mostrará o range de preço automaticamente (ex: <strong>R$ 99 — R$ 299</strong>).
                    </p>
                  </div>

                  {/* Cabeçalho da tabela */}
                  {variants.length > 0 && (
                    <div className="grid grid-cols-12 gap-2 px-1">
                      <div className="col-span-1" />
                      <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome da Variante</div>
                      <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço (R$)</div>
                      <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU (opcional)</div>
                      <div className="col-span-1" />
                    </div>
                  )}

                  {/* Linhas de variante */}
                  {variants.map((variant, idx) => (
                    <div key={variant.id} className="group bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Drag handle visual */}
                        <div className="col-span-1 flex items-center justify-center text-gray-300 dark:text-neutral-700">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Nome */}
                        <input
                          type="text"
                          value={variant.name}
                          onChange={e => updateVariant(variant.id, 'name', e.target.value)}
                          placeholder={`Ex: ${idx === 0 ? 'Básico' : idx === 1 ? 'Padrão' : 'Premium'}`}
                          className="col-span-4 px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                        />

                        {/* Preço */}
                        <div className="col-span-3 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={e => updateVariant(variant.id, 'price', e.target.value)}
                            placeholder="0,00"
                            className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* SKU da variante */}
                        <input
                          type="text"
                          value={variant.sku || ''}
                          onChange={e => updateVariant(variant.id, 'sku', e.target.value)}
                          placeholder="SKU opcional"
                          className="col-span-3 px-3 py-2 text-sm font-mono bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                        />

                        {/* Ações (Duplicate, BestSeller, Recommended, Featured) */}
                        <div className="col-span-12 flex flex-wrap items-center justify-start gap-2 border-t border-gray-100 dark:border-neutral-800/60 pt-3 mt-1">
                          <button
                             type="button"
                             onClick={() => updateVariant(variant.id, 'isBestSeller', !variant.isBestSeller as any)}
                             className={`px-2.5 py-1.5 text-[11px] font-bold tracking-wide uppercase rounded-lg transition-colors flex items-center gap-1.5 ${variant.isBestSeller ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800'}`}
                          >
                             <Star className="w-3.5 h-3.5" />
                             Mais Vendido
                          </button>
                          <button
                             type="button"
                             onClick={() => updateVariant(variant.id, 'isRecommended', !variant.isRecommended as any)}
                             className={`px-2.5 py-1.5 text-[11px] font-bold tracking-wide uppercase rounded-lg transition-colors flex items-center gap-1.5 ${variant.isRecommended ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800'}`}
                          >
                             <ThumbsUp className="w-3.5 h-3.5" />
                             Recomendado
                          </button>
                          <button
                             type="button"
                             onClick={() => updateVariant(variant.id, 'isFeatured', !variant.isFeatured as any)}
                             className={`px-2.5 py-1.5 text-[11px] font-bold tracking-wide uppercase rounded-lg transition-colors flex items-center gap-1.5 ${variant.isFeatured ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800'}`}
                          >
                             <Award className="w-3.5 h-3.5" />
                             Destaque
                          </button>
                          <div className="flex-1" />
                          <button
                            type="button"
                            onClick={() => duplicateVariant(variant.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Duplicar Variante"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariant(variant.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir Variante"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Descrição da variante */}
                      <div className="pl-9">
                        <input
                          type="text"
                          value={variant.description || ''}
                          onChange={e => updateVariant(variant.id, 'description', e.target.value)}
                          placeholder="Descrição opcional (ex: Inclui suporte por 30 dias)"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 text-gray-600 dark:text-gray-400 placeholder-gray-300 dark:placeholder-neutral-700"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Aviso sem variantes */}
                  {variants.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl text-gray-400">
                      <Layers className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm">Nenhuma variante ainda. Clique em "Adicionar Variante" para começar.</p>
                    </div>
                  )}

                  {/* Botão adicionar */}
                  <button
                    onClick={addVariant}
                    className="flex items-center gap-2 w-full px-4 py-2.5 border-2 border-dashed border-gray-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-emerald-500/50 text-gray-500 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-emerald-400 rounded-xl text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Variante
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Blocos Extras ───────────────────────────────────────────── */}
          {fields.length > 0 && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
                <h2 className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Blocos Extras</h2>
                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
              </div>
              {fields.map((field: any, index: number) => (
                <div key={index} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{field.label}</h3>
                  {renderFieldEditor(field)}
                </div>
              ))}
            </>
          )}
        </div>

        {/* ─── SIDEBAR (right 1/3) ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Configurações Gerais */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-400" /> Configurações Gerais</h3>
            <div className="space-y-4">
              {meta.enable_status !== false && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Disponibilidade</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['available', 'out_of_stock'] as const).map(s => (
                      <button key={s} onClick={() => setStatus(s)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${status === s
                          ? s === 'available'
                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'
                          : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700'}`}>
                        {s === 'available' ? 'Disponível' : 'Esgotado'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Tipo de Produto</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'fisico', l: 'Físico' }, { v: 'digital', l: 'Digital' }].map(({ v, l }) => (
                    <button key={v} onClick={() => setProductType(v)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${productType === v
                        ? v === 'fisico'
                          ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400'
                          : 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-400'
                        : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo de Variantes (quando ativo) */}
          {hasVariants && variants.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-blue-500 dark:text-emerald-400" /> Resumo de Variantes</h3>
              <div className="space-y-2">
                {variants.map(v => (
                  <div key={v.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{v.name || <em className="text-gray-400">Sem nome</em>}</span>
                    <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                      {v.price ? formatBRL(v.price) : <span className="text-gray-400 font-normal">—</span>}
                    </span>
                  </div>
                ))}
              </div>
              {priceRange && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 text-xs text-gray-500 dark:text-neutral-500">
                  Range na API: <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {priceRange.same ? formatBRL(priceRange.min) : `${formatBRL(priceRange.min)} – ${formatBRL(priceRange.max)}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tamanhos */}
          {meta.enable_sizes !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><List className="w-4 h-4 text-blue-500" /> Tamanhos</h3>
              <TagSelector value={sizes} onChange={setSizes} placeholder="P, M, G, GG..." />
            </div>
          )}

          {/* Cores */}
          {meta.enable_colors !== false && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 dark:shadow-sm dark:border dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><List className="w-4 h-4 text-amber-500" /> Cores</h3>
              <TagSelector value={colors} onChange={setColors} placeholder="Preto, Branco, Azul..." />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
