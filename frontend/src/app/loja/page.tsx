'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Store, Search, Download, Star, Filter, Sparkles } from 'lucide-react';
import { STORE_MOCK_DATA, StoreExtension } from '@/core/extensions/storeMock';
import { getExtensionsStatus } from '@/core/extensions/actions';
import { ExtensionProfileModal } from '@/components/extensions/ExtensionProfileModal';
import Link from 'next/link';

type SortOption = 'recommended' | 'downloads' | 'rating' | 'newest';

export default function StorePage() {
  const [localStatuses, setLocalStatuses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [selectedExtension, setSelectedExtension] = useState<StoreExtension | null>(null);

  const loadLocalStatuses = async () => {
    const status = await getExtensionsStatus();
    setLocalStatuses(status);
  };

  useEffect(() => {
    loadLocalStatuses();
  }, []);

  // Filter and Sort Logic
  const processedExtensions = STORE_MOCK_DATA.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = filterPrice === 'all' || ext.price === filterPrice;
    return matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'recommended') {
      // Recommended first, then by downloads
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return b.downloads - a.downloads;
    }
    if (sortBy === 'downloads') return b.downloads - a.downloads;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Marketplace
              </h1>
              <p className="text-gray-500 dark:text-neutral-400 mt-1 text-sm">
                Descubra e instale novos módulos para turbinar o seu Dimy CMS.
              </p>
            </div>
          </div>
          
          <Link href="/aplicativos" className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline">
            ← Voltar para Meus Aplicativos
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 lg:p-6 border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou funcionalidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* Price Filter */}
            <div className="flex items-center bg-gray-50 dark:bg-neutral-950 rounded-xl p-1 border border-gray-200 dark:border-neutral-800">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'free', label: 'Grátis' },
                { id: 'paid', label: 'Pagos' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterPrice(f.id as any)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    filterPrice === f.id
                      ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-10 pr-8 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <option value="recommended">Recomendados</option>
                <option value="downloads">Mais Baixados</option>
                <option value="rating">Melhor Avaliação</option>
                <option value="newest">Mais Recentes</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Store Grid */}
        {processedExtensions.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-gray-200 dark:border-neutral-800 rounded-3xl">
            <p className="text-gray-500 dark:text-neutral-400">Nenhum aplicativo encontrado para os filtros atuais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedExtensions.map(ext => {
              const status = localStatuses.find(s => s.id === ext.id);
              
              return (
                <div 
                  key={ext.id}
                  onClick={() => setSelectedExtension(ext)}
                  className="group relative bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-500/30 transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
                >
                  {/* Recommended Badge */}
                  {ext.isRecommended && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Recomendado
                    </div>
                  )}

                  {/* Installed Badge */}
                  {status?.isInstalled && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      Instalado
                    </div>
                  )}

                  <div className={`flex items-start justify-between mb-5 ${ext.isRecommended ? 'mt-7' : ''}`}>
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 flex items-center justify-center p-3 group-hover:scale-105 transition-transform">
                      <div className="w-full h-full bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Store className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                      ext.price === 'free' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                        : 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                    }`}>
                      {ext.price === 'free' ? 'Grátis' : 'Pago'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {ext.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium mb-3">{ext.author}</span>
                  
                  <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2 mb-6 flex-1">
                    {ext.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {ext.rating} <span className="text-gray-400 font-normal">({ext.reviews.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Download className="w-3.5 h-3.5" />
                      {ext.downloads > 1000 ? (ext.downloads/1000).toFixed(1) + 'k' : ext.downloads}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {selectedExtension && (
        <ExtensionProfileModal
          extension={selectedExtension}
          localStatus={localStatuses.find(s => s.id === selectedExtension.id)}
          onClose={() => setSelectedExtension(null)}
          onRefresh={loadLocalStatuses}
        />
      )}
    </DashboardLayout>
  );
}
