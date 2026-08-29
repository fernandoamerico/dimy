'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getDocuments, deleteDocument } from '@/core/content/actions';
import { getCollections } from '@/core/schema/actions';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Package, Tags, Plus, Trash2, Edit2, Search, Filter, X,
  ChevronDown, RotateCcw, AlertTriangle, SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DocItem {
  id: string;
  collectionId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  _categoryName: string;
  _categorySlug: string;
  _trashedAt?: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ProdutosDashboard() {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Trash state (stored locally as soft-delete in state)
  const [trashedIds, setTrashedIds] = useState<Set<string>>(new Set());
  const [showTrash, setShowTrash] = useState(false);

  // Dropdown for new product category selection
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────
  const fetchContent = useCallback(async () => {
    setLoading(true);
    const collections = await getCollections();
    const productCategories = collections.filter((col: any) => {
      try { return JSON.parse(col.metadata || '{}').is_product === true; } catch { return false; }
    });
    setAllCategories(productCategories);

    let allDocs: DocItem[] = [];
    for (const cat of productCategories) {
      const docs = await getDocuments(cat.id);
      const docsWithCat = docs.map((d: any) => ({
        ...d,
        _categoryName: cat.name,
        _categorySlug: cat.slug,
      }));
      allDocs = [...allDocs, ...docsWithCat];
    }
    setDocuments(allDocs);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  // ─── Filtered lists ────────────────────────────────────────────────────
  const activeDocs = useMemo(() =>
    documents.filter(d => !trashedIds.has(d.id)), [documents, trashedIds]);

  const trashedDocs = useMemo(() =>
    documents.filter(d => trashedIds.has(d.id)), [documents, trashedIds]);

  const filteredDocs = useMemo(() => {
    return activeDocs.filter(doc => {
      const title = (doc.data?._title || '').toLowerCase();
      const sku = (doc.data?._sku || '').toLowerCase();
      const matchSearch = !search || title.includes(search.toLowerCase()) || sku.includes(search.toLowerCase());
      const matchCategory = !filterCategory || doc.collectionId === filterCategory;
      const matchStatus = !filterStatus || (doc.data?._status || 'available') === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [activeDocs, search, filterCategory, filterStatus]);

  // ─── Selection ────────────────────────────────────────────────────────
  const isAllSelected = filteredDocs.length > 0 && filteredDocs.every(d => selected.has(d.id));
  const toggleAll = () => {
    if (isAllSelected) {
      setSelected(prev => { const s = new Set(prev); filteredDocs.forEach(d => s.delete(d.id)); return s; });
    } else {
      setSelected(prev => { const s = new Set(prev); filteredDocs.forEach(d => s.add(d.id)); return s; });
    }
  };
  const toggleOne = (id: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  // ─── Trash ────────────────────────────────────────────────────────────
  const sendToTrash = (ids: string[]) => {
    setTrashedIds(prev => { const s = new Set(prev); ids.forEach(id => s.add(id)); return s; });
    setSelected(new Set());
    toast.success(`${ids.length} produto(s) enviados para a lixeira.`);
  };

  const restoreFromTrash = (id: string) => {
    setTrashedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    toast.success('Produto restaurado!');
  };

  const permanentlyDelete = async (id: string, slug: string) => {
    if (!confirm('Excluir permanentemente este produto? Esta ação não pode ser desfeita.')) return;
    const res = await deleteDocument(id, slug);
    if (res.success) {
      setTrashedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Produto excluído permanentemente.');
    } else {
      toast.error('Erro ao excluir produto.');
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
              Produtos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gerencie seu catálogo de produtos, preços e estoque.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Categorias — botão compacto */}
            <Link
              href="/produtos/categorias"
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Tags className="w-4 h-4" />
              Categorias
            </Link>

            {/* Lixeira */}
            <button
              onClick={() => setShowTrash(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border text-sm font-medium rounded-xl transition-colors shadow-sm ${showTrash
                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'
                : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
            >
              <Trash2 className="w-4 h-4" />
              Lixeira {trashedDocs.length > 0 && <span className="ml-0.5 text-xs font-bold">({trashedDocs.length})</span>}
            </button>

            {/* Novo Produto */}
            {allCategories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowNewDropdown(v => !v)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Novo Produto
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showNewDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showNewDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNewDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg z-20 flex flex-col py-2">
                      <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Escolha a categoria</div>
                      {allCategories.map(cat => (
                        <Link
                          key={cat.id}
                          href={`/produtos/item?slug=${cat.slug}&id=novo`}
                          onClick={() => setShowNewDropdown(false)}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Lixeira ───────────────────────────────────────────────── */}
        {showTrash && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100 dark:border-red-900/40 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-red-600 dark:text-red-400">Lixeira</h2>
              <span className="text-xs text-red-400">— Itens aguardando exclusão permanente</span>
            </div>
            {trashedDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Trash2 className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">A lixeira está vazia.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {trashedDocs.map(doc => {
                    const title = doc.data?._title || 'Produto sem nome';
                    const itemSlug = doc._categorySlug;
                    return (
                      <tr key={doc.id} className="hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-colors group">
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-700 dark:text-gray-300 line-through opacity-60">{title}</span>
                          <span className="ml-2 text-xs text-gray-400">{doc._categoryName}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => restoreFromTrash(doc.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-emerald-400 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                            </button>
                            <button
                              onClick={() => permanentlyDelete(doc.id, itemSlug)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Sem categorias ────────────────────────────────────────── */}
        {allCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-5">
              <Tags className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhuma categoria criada</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
              Antes de cadastrar produtos, você precisa criar ao menos uma categoria (ex: Camisetas, Eletrônicos) para organizar seu catálogo.
            </p>
            <Link
              href="/produtos/categorias"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Categoria
            </Link>
          </div>
        ) : activeDocs.length === 0 && !search && !filterCategory && !filterStatus ? (
          /* ── Tem categorias, mas sem produtos ─────────────────────── */
          <div className="flex flex-col items-center justify-center text-center p-16 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-neutral-800">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mb-5">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
              Você já tem {allCategories.length} categoria{allCategories.length > 1 ? 's' : ''} criada{allCategories.length > 1 ? 's' : ''}. Agora é só adicionar seu primeiro produto!
            </p>
            <div className="flex flex-col gap-3 items-center">
              {allCategories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/produtos/item?slug=${cat.slug}&id=novo`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 text-sm"
                >
                  <Plus className="w-4 h-4" /> Novo produto em "{cat.name}"
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* ── Lista de produtos ────────────────────────────────────── */
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">

            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">

              {/* Seleção em massa */}
              {selected.size > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                  <span className="text-sm font-semibold text-blue-600 dark:text-emerald-400">{selected.size} selecionado(s)</span>
                  <button
                    onClick={() => sendToTrash(Array.from(selected))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Enviar para lixeira
                  </button>
                  <button onClick={() => setSelected(new Set())} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap ml-auto">
                {/* Busca */}
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nome ou SKU..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
                  />
                </div>

                {/* Filtro categoria */}
                <div className="relative">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-700 dark:text-gray-300 appearance-none cursor-pointer"
                  >
                    <option value="">Todas as categorias</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro status */}
                <div className="relative">
                  <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-700 dark:text-gray-300 appearance-none cursor-pointer"
                  >
                    <option value="">Todos os status</option>
                    <option value="available">Disponível</option>
                    <option value="out_of_stock">Esgotado</option>
                  </select>
                </div>

                {/* Limpar filtros */}
                {(search || filterCategory || filterStatus) && (
                  <button
                    onClick={() => { setSearch(''); setFilterCategory(''); setFilterStatus(''); }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Limpar filtros"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabela */}
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <Search className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm">Nenhum produto encontrado com os filtros aplicados.</p>
                <button onClick={() => { setSearch(''); setFilterCategory(''); setFilterStatus(''); }} className="mt-3 text-sm text-blue-500 dark:text-emerald-400 hover:underline">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/70 dark:bg-neutral-950/60 border-b border-gray-100 dark:border-neutral-800 text-xs uppercase text-gray-500 dark:text-neutral-500">
                  <tr>
                    <th className="px-5 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 dark:accent-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-3.5 font-semibold">Produto</th>
                    <th className="px-5 py-3.5 font-semibold">ID</th>
                    <th className="px-5 py-3.5 font-semibold">SKU</th>
                    <th className="px-5 py-3.5 font-semibold">Categoria</th>
                    <th className="px-5 py-3.5 font-semibold">Preço</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                  {filteredDocs.map(doc => {
                    const title = doc.data?._title || 'Produto sem nome';
                    const sku = doc.data?._sku || '—';
                    const price = doc.data?._price ? `R$ ${parseFloat(doc.data._price).toFixed(2)}` : '—';
                    const isAvailable = (doc.data?._status || 'available') === 'available';
                    const isSelected = selected.has(doc.id);

                    return (
                      <tr
                        key={doc.id}
                        className={`group transition-colors ${isSelected ? 'bg-blue-50/60 dark:bg-emerald-500/5' : 'hover:bg-gray-50/60 dark:hover:bg-neutral-800/40'}`}
                      >
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(doc.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 dark:accent-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {doc.data?._mainImage ? (
                              <img src={doc.data._mainImage} alt={title} className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <code className="text-xs text-gray-400 dark:text-neutral-500 font-mono bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">{doc.id.slice(0, 8)}…</code>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-gray-600 dark:text-neutral-400">{sku}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                            <Tags className="w-3 h-3" />{doc._categoryName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-gray-900 dark:text-white font-medium text-sm">{price}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {isAvailable ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 rounded-full dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50">
                              Disponível
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 rounded-full dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/50">
                              Esgotado
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/produtos/item?slug=${doc._categorySlug}&id=${doc.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => sendToTrash([doc.id])}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Enviar para lixeira"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Footer da tabela */}
            {filteredDocs.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs text-gray-400 dark:text-neutral-500">
                <span>{filteredDocs.length} produto(s) {(search || filterCategory || filterStatus) ? 'encontrado(s)' : 'no total'}</span>
                {selected.size > 0 && (
                  <button
                    onClick={() => sendToTrash(Array.from(selected))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Enviar {selected.size} para lixeira
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
