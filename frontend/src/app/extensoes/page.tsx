'use client';

import { useState, useEffect } from 'react';
import { getExtensionsStatus, installExtension, toggleExtension } from '@/core/extensions/actions';
import { Blocks, CheckCircle2, Download, Power, ShieldAlert, FileText, Package, LayoutDashboard, Settings, Search, Store } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const IconsMap: Record<string, any> = {
  FileText,
  Package,
  LayoutDashboard,
  Settings,
  Blocks
};

type FilterType = 'all' | 'active' | 'inactive' | 'installed' | 'uninstalled';

export default function ExtensoesPage() {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  async function loadExtensions() {
    setIsLoading(true);
    const data = await getExtensionsStatus();
    setExtensions(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadExtensions();
  }, []);

  const handleInstall = async (id: string) => {
    if (!confirm('Deseja instalar esta extensão e criar as estruturas necessárias no banco?')) return;
    
    setActionLoading(id);
    const res = await installExtension(id);
    if (res.success) {
      alert('Extensão instalada com sucesso!');
      await loadExtensions();
    } else {
      alert('Erro: ' + res.error);
    }
    setActionLoading(null);
  };

  const handleToggle = async (id: string, currentState: boolean, isEssential: boolean) => {
    if (currentState && isEssential) {
      alert('Esta extensão é essencial e não pode ser desativada.');
      return;
    }

    setActionLoading(id);
    const res = await toggleExtension(id, !currentState);
    if (res.success) {
      await loadExtensions();
    } else {
      alert('Erro: ' + res.error);
    }
    setActionLoading(null);
  };

  const renderCard = (ext: any) => {
    const isWorking = actionLoading === ext.id;
    const Icon = IconsMap[ext.schema?.iconName || ext.navItems?.[0]?.iconName || 'Blocks'] || Blocks;

    return (
      <div key={ext.id} className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md rounded-2xl p-6 flex flex-col h-full transition-all hover:bg-white/80 dark:hover:bg-neutral-900/80">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-xl">
            <Icon strokeWidth={1.5} className="w-6 h-6" />
          </div>
          
          {ext.isEssential && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-2 py-1 rounded-md">
              <ShieldAlert className="w-3 h-3" /> Essencial
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{ext.name}</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400 flex-1 mb-6 leading-relaxed">{ext.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          {!ext.isInstalled ? (
            <button
              onClick={() => handleInstall(ext.id)}
              disabled={isWorking}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> 
              {isWorking ? 'Instalando...' : 'Instalar'}
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Instalado
              </span>
              
              <button
                onClick={() => handleToggle(ext.id, ext.isEnabled, ext.isEssential)}
                disabled={isWorking || ext.isEssential}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                  ext.isEnabled 
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20' 
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                } ${ext.isEssential ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={ext.isEnabled ? 'Desativar' : 'Ativar'}
              >
                <Power className="w-4 h-4" />
                {ext.isEnabled ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filtragem
  const filteredExtensions = extensions.filter(ext => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = ext.name.toLowerCase().includes(searchLower) || ext.description.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;

    if (currentFilter === 'active') return ext.isEnabled;
    if (currentFilter === 'inactive') return ext.isInstalled && !ext.isEnabled;
    if (currentFilter === 'installed') return ext.isInstalled;
    if (currentFilter === 'uninstalled') return !ext.isInstalled;
    
    return true; // 'all'
  });

  const coreExtensions = filteredExtensions.filter(e => e.type === 'core');
  const schemaExtensions = filteredExtensions.filter(e => e.type === 'schema');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-2xl border border-blue-200 dark:border-emerald-500/20">
              <Blocks className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Extensões
              </h1>
              <p className="text-gray-500 dark:text-neutral-400 mt-1 text-sm">
                Gerencie módulos ou descubra novas ferramentas para o seu CMS.
              </p>
            </div>
          </div>

          <button 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
            onClick={() => setIsStoreModalOpen(true)}
          >
            <Store className="w-4 h-4" />
            Ir para a Loja
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar extensões instaladas ou não..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-emerald-500/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'installed', label: 'Instaladas' },
              { id: 'active', label: 'Ativas' },
              { id: 'inactive', label: 'Desativadas' },
              { id: 'uninstalled', label: 'Não Instaladas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCurrentFilter(f.id as FilterType)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  currentFilter === f.id
                    ? 'bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 border border-blue-200 dark:border-emerald-500/20'
                    : 'bg-transparent text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-500 dark:text-neutral-400">
            Carregando Extensões...
          </div>
        ) : (
          <div className="space-y-8">
            {coreExtensions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Módulos Core (Painel)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreExtensions.map(renderCard)}
                </div>
              </div>
            )}

            {schemaExtensions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Módulos de Conteúdo (Coleções)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schemaExtensions.map(renderCard)}
                </div>
              </div>
            )}
            
            {coreExtensions.length === 0 && schemaExtensions.length === 0 && (
              <div className="py-12 text-center border border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl">
                <p className="text-gray-500 dark:text-neutral-400">Nenhuma extensão encontrada para o filtro atual.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Store Modal Popup */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-5">
              <div className="p-4 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full">
                <Store className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Loja de Extensões</h3>
            <p className="text-center text-gray-500 dark:text-neutral-400 mb-6 leading-relaxed">
              A integração com o marketplace oficial estará disponível em breve na versão final da API. Fique ligado para novos módulos!
            </p>
            <button 
              onClick={() => setIsStoreModalOpen(false)}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
