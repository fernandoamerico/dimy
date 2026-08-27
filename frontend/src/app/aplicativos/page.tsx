'use client';

import { useState, useEffect } from 'react';
import { getExtensionsStatus, installExtension, toggleExtension, uninstallExtension } from '@/core/extensions/actions';
import { Blocks, CheckCircle2, Download, Power, ShieldAlert, FileText, Package, LayoutDashboard, Settings, Search, Store, Trash2, X, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { ExtensionProfileModal } from '@/components/extensions/ExtensionProfileModal';
import { STORE_MOCK_DATA, StoreExtension } from '@/core/extensions/storeMock';
import { toast } from 'sonner';

const IconsMap: Record<string, any> = {
  FileText,
  Package,
  LayoutDashboard,
  Settings,
  Blocks
};

type FilterType = 'all' | 'active' | 'inactive' | 'installed' | 'uninstalled';

export default function AplicativosPage() {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [selectedExtension, setSelectedExtension] = useState<StoreExtension | null>(null);
  
  // Uninstall Modal State
  const [isUninstallModalOpen, setIsUninstallModalOpen] = useState(false);
  const [extensionToUninstall, setExtensionToUninstall] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [uninstallError, setUninstallError] = useState('');
  const [isUninstallSuccess, setIsUninstallSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    setActionLoading(id);
    const res = await installExtension(id);
    await new Promise(resolve => setTimeout(resolve, 800)); // Delay artificial para feedback visual
    if (res.success) {
      toast.success('Aplicativo instalado com sucesso!');
      await loadExtensions();
    } else {
      toast.error('Erro ao instalar: ' + res.error);
    }
    setActionLoading(null);
  };

  const handleToggle = async (id: string, currentState: boolean, isEssential: boolean) => {
    if (currentState && isEssential) {
      toast.info('Este aplicativo é essencial e não pode ser desativado.');
      return;
    }

    setActionLoading(id);
    const res = await toggleExtension(id, !currentState);
    await new Promise(resolve => setTimeout(resolve, 800)); // Delay artificial para feedback visual
    if (res.success) {
      toast.success(`Aplicativo ${!currentState ? 'ativado' : 'desativado'} com sucesso!`);
      await loadExtensions();
    } else {
      toast.error('Erro ao alterar status: ' + res.error);
    }
    setActionLoading(null);
  };

  const handleUninstallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extensionToUninstall || !adminPassword || !confirmDelete) return;

    setUninstallError('');
    setActionLoading(extensionToUninstall.id);
    
    const res = await uninstallExtension(extensionToUninstall.id, adminPassword);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay artificial
    if (res.success) {
      setIsUninstallSuccess(true);
      await loadExtensions();
    } else {
      setUninstallError(res.error || 'Erro ao desinstalar aplicativo.');
    }
    setActionLoading(null);
  };

  const renderCard = (ext: any) => {
    const isWorking = actionLoading === ext.id;
    const Icon = IconsMap[ext.schema?.iconName || ext.navItems?.[0]?.iconName || 'Blocks'] || Blocks;

    // Build or fetch StoreExtension object for the modal
    const handleCardClick = () => {
      const storeData = STORE_MOCK_DATA.find(s => s.id === ext.id);
      if (storeData) {
        setSelectedExtension(storeData);
      } else {
        // Fallback for core extensions not in mock
        setSelectedExtension({
          id: ext.id,
          name: ext.name,
          description: ext.description,
          longDescription: ext.description,
          iconName: ext.schema?.iconName || ext.navItems?.[0]?.iconName || 'Blocks',
          author: 'Equipe Dimy',
          rating: 5.0,
          downloads: 10000,
          price: ext.price || 'free',
          screenshots: [],
          reviews: [],
          createdAt: new Date().toISOString()
        });
      }
    };

    return (
      <div 
        key={ext.id} 
        onClick={handleCardClick}
        className="group bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-700/80 rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:bg-white dark:hover:bg-neutral-900 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-neutral-600 hover:-translate-y-1 cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-xl">
            <Icon strokeWidth={1.5} className="w-6 h-6" />
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Price Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium ${
              ext.price === 'paid' 
                ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' 
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            }`}>
              {ext.price === 'paid' ? 'Pago' : 'Grátis'}
            </span>

            {ext.isEssential && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-2 py-1 rounded-md">
                <ShieldAlert className="w-3 h-3" /> Essencial
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition-colors">{ext.name}</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400 flex-1 mb-6 leading-relaxed">{ext.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
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
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(ext.id, ext.isEnabled, ext.isEssential)}
                  disabled={isWorking || ext.isEssential}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                    ext.isEnabled 
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20' 
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                  } ${ext.isEssential ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={ext.isEnabled ? 'Desativar' : 'Ativar'}
                >
                  <Power className="w-4 h-4" />
                  {ext.isEnabled ? '' : 'Ativar'}
                </button>
                
                <button
                  onClick={() => {
                    setExtensionToUninstall(ext);
                    setIsUninstallModalOpen(true);
                  }}
                  disabled={isWorking || ext.isEssential}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 ${ext.isEssential ? 'hidden' : ''}`}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
  const nonCoreExtensions = filteredExtensions.filter(e => e.type !== 'core');

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
                Aplicativos
              </h1>
              <p className="text-gray-500 dark:text-neutral-400 mt-1 text-sm">
                Gerencie aplicativos ou descubra novas ferramentas para o seu CMS.
              </p>
            </div>
          </div>

          <Link 
            href="/loja"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
          >
            <Store className="w-4 h-4" />
            Ir para a Loja de Apps
          </Link>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar aplicativos instalados ou não..."
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
            Carregando Aplicativos...
          </div>
        ) : (
          <div className="space-y-8">
            {nonCoreExtensions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Módulos de Conteúdo e Extras
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nonCoreExtensions.map(renderCard)}
                </div>
              </div>
            )}
            
            {coreExtensions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Aplicativos Essenciais (Painel)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreExtensions.map(renderCard)}
                </div>
              </div>
            )}

            {coreExtensions.length === 0 && nonCoreExtensions.length === 0 && (
              <div className="py-12 text-center border border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl">
                <p className="text-gray-500 dark:text-neutral-400">Nenhum aplicativo encontrado para o filtro atual.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Extension Profile Modal */}
      {selectedExtension && (
        <ExtensionProfileModal
          extension={selectedExtension}
          localStatus={extensions.find(e => e.id === selectedExtension.id)}
          onClose={() => setSelectedExtension(null)}
          onRefresh={loadExtensions}
        />
      )}

      {/* Uninstall Confirmation Modal */}
      {isUninstallModalOpen && extensionToUninstall && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-red-200 dark:border-red-900/30 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Excluir Aplicativo
              </h2>
              <button
                onClick={() => {
                  setIsUninstallModalOpen(false);
                  setExtensionToUninstall(null);
                  setAdminPassword('');
                  setUninstallError('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isUninstallSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Desinstalado com Sucesso!</h3>
                <p className="text-gray-500 dark:text-neutral-400 text-sm">
                  O aplicativo <strong>{extensionToUninstall.name}</strong> e todos os seus dados foram removidos permanentemente do sistema.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsUninstallModalOpen(false);
                      setExtensionToUninstall(null);
                      setAdminPassword('');
                      setUninstallError('');
                      setIsUninstallSuccess(false);
                      setConfirmDelete(false);
                    }}
                    className="w-full px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUninstallSubmit} className="p-5 space-y-4">
                <div className="bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-900/50">
                  <p className="font-bold mb-1">Aviso Crítico!</p>
                  <p>
                    Você está prestes a excluir o aplicativo <strong>{extensionToUninstall.name}</strong>.
                    Isso irá <strong>apagar permanentemente</strong> todos os dados vinculados a ela no banco de dados. Esta ação não pode ser desfeita.
                  </p>
                </div>

                {uninstallError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
                    {uninstallError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha do Administrador
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-red-600/20 dark:focus:ring-red-500/20 focus:border-red-600 dark:focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                    placeholder="Confirme com sua senha"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="confirmDelete"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                    className="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="confirmDelete" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                    Estou ciente de que perderei permanentemente todos os dados vinculados a este aplicativo ao prosseguir.
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUninstallModalOpen(false);
                      setExtensionToUninstall(null);
                      setAdminPassword('');
                      setUninstallError('');
                      setConfirmDelete(false);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === extensionToUninstall.id || !adminPassword || !confirmDelete}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === extensionToUninstall.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Confirmar Exclusão
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
