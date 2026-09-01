'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Star, Download, ChevronRight, ShieldAlert, User, Clock, CheckCircle2, MessageSquare, Loader2, Power, Trash2, Image as ImageIcon, Settings } from 'lucide-react';
import { StoreExtension } from '@/core/extensions/storeMock';
import { getExtensionsStatus, installExtension, toggleExtension, uninstallExtension } from '@/core/extensions/actions';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { toast } from 'sonner';

interface ExtensionProfileModalProps {
  extension: StoreExtension;
  localStatus?: any; // The status from getExtensionsStatus (isInstalled, isEnabled, isEssential)
  onClose: () => void;
  onRefresh: () => void;
}

export function ExtensionProfileModal({ extension, localStatus, onClose, onRefresh }: ExtensionProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'configure'>('details');
  const [isWorking, setIsWorking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // For uninstall modal inside profile
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [uninstallError, setUninstallError] = useState('');
  const [businessLogo, setBusinessLogo] = useState('');

  // Supabase Storage config state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseBucket, setSupabaseBucket] = useState('');
  const [isLoadingSupabaseConfig, setIsLoadingSupabaseConfig] = useState(false);
  const [supabaseConfigLoaded, setSupabaseConfigLoaded] = useState(false);

  useEffect(() => {
    if (activeTab === 'configure' && extension.id === 'supabase_storage' && !supabaseConfigLoaded) {
      setIsLoadingSupabaseConfig(true);
      Promise.all([
        fetch('/api/system/config?key=supabase_storage_url').then(r => r.json()).catch(() => ({value: ''})),
        fetch('/api/system/config?key=supabase_storage_bucket').then(r => r.json()).catch(() => ({value: ''}))
      ]).then(([urlRes, bucketRes]) => {
        setSupabaseUrl(urlRes.value || '');
        setSupabaseBucket(bucketRes.value || '');
        setSupabaseConfigLoaded(true);
        setIsLoadingSupabaseConfig(false);
      });
    }
  }, [activeTab, extension.id, supabaseConfigLoaded]);

  const isFakeStoreExtension = extension.id.startsWith('store_');

  const handleInstall = async () => {
    if (isFakeStoreExtension) {
      toast.info('Este é um aplicativo fictício de demonstração da Loja. Na versão final, ele seria instalado!');
      return;
    }
    
    setIsWorking(true);
    const res = await installExtension(extension.id);
    if (res.success) {
      onRefresh();
    } else {
      toast.error('Erro: ' + res.error);
    }
    setIsWorking(false);
  };

  const handleToggle = async () => {
    if (!localStatus) return;
    if (localStatus.isEnabled && localStatus.isEssential) {
      toast.error('Este aplicativo é essencial e não pode ser desativado.');
      return;
    }

    setIsWorking(true);
    const res = await toggleExtension(extension.id, !localStatus.isEnabled);
    if (res.success) {
      onRefresh();
    } else {
      toast.error(res.error);
    }
    setIsWorking(false);
  };

  const handleUninstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;

    setUninstallError('');
    setIsWorking(true);
    
    const res = await uninstallExtension(extension.id, adminPassword);
    if (res.success) {
      setShowUninstallConfirm(false);
      onRefresh();
      onClose(); // Fechar o perfil se foi desinstalado, ou manter aberto e atualizar status
    } else {
      setUninstallError(res.error || 'Erro ao desinstalar.');
    }
    setIsWorking(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-neutral-700'}`} 
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-center p-0 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 w-full md:max-w-4xl min-h-screen md:min-h-0 md:rounded-3xl shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header Area with gradient background */}
        <div className="relative pt-12 pb-6 px-6 md:px-10 bg-gradient-to-b from-blue-50 to-white dark:from-emerald-900/20 dark:to-neutral-900 border-b border-gray-100 dark:border-neutral-800 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* App Icon */}
            <div className="w-24 h-24 shrink-0 bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 flex items-center justify-center p-1">
              <div className="w-full h-full bg-blue-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-blue-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* App Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{extension.name}</h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-neutral-400 mb-4">
                <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-emerald-400">
                  <User className="w-4 h-4" /> {extension.author}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white mr-1">{extension.rating}</span>
                  {renderStars(extension.rating)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> {extension.downloads.toLocaleString()} downloads
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  extension.price === 'free' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                }`}>
                  {extension.price === 'free' ? 'Grátis' : 'Pago'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {localStatus?.isInstalled ? (
                  <>
                    {localStatus.isEssential ? (
                      <span className="text-sm text-gray-400 dark:text-neutral-500 italic">
                        Aplicativos essenciais não podem ser desativados ou excluídos.
                      </span>
                    ) : (
                      <>
                        {extension.id === 'business_info' && (
                          <Link
                            href="/meu-negocio"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                          >
                            <Settings className="w-4 h-4" /> Configurar
                          </Link>
                        )}
                        {extension.id === 'cloudflare_r2' && (
                          <button
                            onClick={() => setActiveTab('configure')}
                            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                          >
                            <Settings className="w-4 h-4" /> Configurar
                          </button>
                        )}
                        {extension.id === 'supabase_storage' && (
                          <button
                            onClick={() => setActiveTab('configure')}
                            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                          >
                            <Settings className="w-4 h-4" /> Configurar
                          </button>
                        )}
                        <button
                          onClick={() => setShowUninstallConfirm(true)}
                          disabled={isWorking}
                          className="px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {extension.id === 'supabase_config' && (
                          <Link
                            href="/supabase"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                          >
                            <Settings className="w-4 h-4" /> Configurar
                          </Link>
                        )}
                      </>
                    )}
                  </>
                ) : localStatus?.isInstalled ? (
                  <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Já instalado
                  </span>
                ) : (
                  <button
                    onClick={handleInstall}
                    disabled={isWorking}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Baixar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Uninstall Confirmation In-Modal Overlay */}
          {showUninstallConfirm && (
            <div className="absolute inset-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center animate-in fade-in">
              <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Confirmar Exclusão</h3>
                  <p className="text-gray-500 dark:text-neutral-400 mt-2">
                    Você perderá todos os dados atrelados ao aplicativo <strong>{extension.name}</strong> permanentemente.
                  </p>
                </div>

                <form onSubmit={handleUninstall} className="space-y-4">
                  {uninstallError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl">
                      {uninstallError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha do Administrador</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-red-600/20 outline-none text-gray-900 dark:text-white"
                      placeholder="Sua senha..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUninstallConfirm(false)}
                      className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isWorking || !adminPassword}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Screenshots Gallery */}
          {extension.screenshots.length > 0 && (
            <div className="px-6 md:px-10 py-8 overflow-hidden">
              <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-4">
                {extension.screenshots.map((img, idx) => (
                  <div key={idx} className="shrink-0 snap-center first:pl-0">
                    <img 
                      src={img} 
                      alt={`Screenshot ${idx + 1}`} 
                      className="h-48 md:h-64 object-cover rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="px-6 md:px-10 border-b border-gray-100 dark:border-neutral-800 flex gap-8">
            <button 
              onClick={() => setActiveTab('details')}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'details' 
                  ? 'border-blue-600 text-blue-600 dark:border-emerald-400 dark:text-emerald-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Sobre o Aplicativo
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'reviews' 
                  ? 'border-blue-600 text-blue-600 dark:border-emerald-400 dark:text-emerald-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Avaliações <span className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 px-2 py-0.5 rounded-full text-[10px]">{extension.reviews.length}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-10">
            {activeTab === 'details' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                  {extension.longDescription}
                </p>
                <div className="mt-8 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl flex items-center gap-4 text-sm text-gray-500 dark:text-neutral-400">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>Publicado em: <strong>{new Date(extension.createdAt).toLocaleDateString('pt-BR')}</strong></span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {extension.reviews.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-neutral-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhuma avaliação ainda.
                  </div>
                ) : (
                  extension.reviews.map(review => (
                    <div key={review.id} className="p-5 bg-gray-50 dark:bg-neutral-800/30 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full" />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{review.userName}</div>
                            <div className="text-[11px] text-gray-500">{new Date(review.date).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-neutral-300 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'configure' && extension.id === 'cloudflare_r2' && (
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-900/50 flex gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Cuidado com a Migração de Dados</p>
                    <p>Não há migração automática de arquivos. Se você trocar de provedor de Storage, novos envios irão para o novo local. No entanto, se você deletar o bucket antigo ou parar de pagar o serviço anterior, as imagens antigas do site aparecerão quebradas.</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 p-4 rounded-xl text-sm border border-blue-200 dark:border-blue-900/50">
                  <p className="font-bold mb-1">Configuração do Cloudflare R2</p>
                  <p>Insira as credenciais do seu bucket R2 para habilitar o upload direto na nuvem. As chaves serão salvas de forma segura no banco de dados.</p>
                </div>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsWorking(true);
                    const formData = new FormData(e.currentTarget);
                    
                    const accountId = formData.get('r2_account_id') as string;
                    const bucket = formData.get('r2_bucket') as string;
                    const accessKey = formData.get('r2_access_key') as string;
                    const secretKey = formData.get('r2_secret_key') as string;

                    try {
                      const testRes = await fetch('/api/system/test-r2', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          r2_account_id: accountId,
                          r2_bucket: bucket,
                          r2_access_key: accessKey,
                          r2_secret_key: secretKey
                        })
                      });
                      
                      if (!testRes.ok) {
                        const errMsg = await testRes.text();
                        toast.error('Conexão falhou: ' + errMsg + '. As configurações NÃO foram salvas.');
                        setIsWorking(false);
                        return;
                      }
                    } catch (err) {
                      toast.error('Erro de rede ao testar conexão. As configurações NÃO foram salvas.');
                      setIsWorking(false);
                      return;
                    }

                    try {
                      for (let [key, value] of formData.entries()) {
                        await fetch('/api/system/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key, value })
                        });
                      }
                      toast.success('Conexão verificada e configurações salvas com sucesso!');
                    } catch (err) {
                      toast.error('Erro ao salvar as configurações.');
                    }
                    setIsWorking(false);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account ID</label>
                      <input name="r2_account_id" type="text" required placeholder="Ex: 8a7c2..." className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bucket Name</label>
                      <input name="r2_bucket" type="text" required placeholder="Ex: meu-cms-assets" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Access Key ID</label>
                      <input name="r2_access_key" type="text" required className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Access Key</label>
                      <input name="r2_secret_key" type="password" required className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Domínio Público (Public Dev Domain ou Custom Domain)</label>
                      <input name="r2_public_domain" type="url" required placeholder="Ex: https://pub-xxxxxx.r2.dev" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isWorking}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Credenciais'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {activeTab === 'configure' && extension.id === 'supabase_storage' && (
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-900/50 flex gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Cuidado com a Migração de Dados</p>
                    <p>Não há migração automática de arquivos. Se você trocar de provedor de Storage, novos envios irão para o novo local. No entanto, se você deletar o bucket antigo ou parar de pagar o serviço anterior, as imagens antigas do site aparecerão quebradas.</p>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-900/50">
                  <p className="font-bold mb-1">Configuração do Supabase Storage</p>
                  <p>Insira as credenciais do seu projeto Supabase para habilitar o upload direto para seus Buckets.</p>
                </div>
                
                {isLoadingSupabaseConfig ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsWorking(true);
                    const formData = new FormData(e.currentTarget);
                    
                    const url = formData.get('supabase_storage_url') as string;
                    const key = formData.get('supabase_storage_key') as string;
                    const bucket = formData.get('supabase_storage_bucket') as string;
                    
                    try {
                      const testRes = await fetch('/api/system/test-supabase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          supabase_storage_url: url,
                          supabase_storage_key: key,
                          supabase_storage_bucket: bucket
                        })
                      });
                      
                      if (!testRes.ok) {
                        const errMsg = await testRes.text();
                        toast.error('Conexão falhou: ' + errMsg + '. As configurações NÃO foram salvas.');
                        setIsWorking(false);
                        return;
                      }
                    } catch (err) {
                      toast.error('Erro de rede ao testar conexão. As configurações NÃO foram salvas.');
                      setIsWorking(false);
                      return;
                    }

                    try {
                      for (let [formKey, formValue] of formData.entries()) {
                        await fetch('/api/system/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key: formKey, value: formValue })
                        });
                      }
                      toast.success('Conexão verificada e configurações salvas com sucesso!');
                    } catch (err) {
                      toast.error('Erro ao salvar as configurações.');
                    }
                    setIsWorking(false);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Supabase URL</label>
                      <input name="supabase_storage_url" type="url" required value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)} placeholder="Ex: https://xxxx.supabase.co" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Role Key (Secret)</label>
                      <input name="supabase_storage_key" type="password" required placeholder={supabaseConfigLoaded && (supabaseUrl || supabaseBucket) ? "••••••••••••••••" : "Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."} className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-gray-900 dark:text-white" />
                      <p className="text-[11px] text-gray-500">Utilize a Service Role Key (e não a Anon Key) para que o servidor tenha permissão de gravar no bucket sem depender de regras RLS.</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Bucket</label>
                      <input name="supabase_storage_bucket" type="text" required value={supabaseBucket} onChange={e => setSupabaseBucket(e.target.value)} placeholder="Ex: dimy-images" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  
                  
                  <div className="pt-4 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        const keyInput = document.querySelector<HTMLInputElement>('input[name="supabase_storage_key"]');
                        const keyValue = keyInput?.value || '';
                        
                        if (!supabaseUrl || !keyValue || !supabaseBucket) {
                          toast.error('Preencha todos os campos antes de testar.');
                          return;
                        }

                        const loadingToast = toast.loading('Testando conexão com o Supabase...');
                        try {
                          const res = await fetch('/api/system/test-supabase', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              supabase_storage_url: supabaseUrl,
                              supabase_storage_key: keyValue,
                              supabase_storage_bucket: supabaseBucket
                            })
                          });
                          if (res.ok) {
                            toast.success('Conexão estabelecida com sucesso!', { id: loadingToast });
                          } else {
                            const errData = await res.text();
                            toast.error('Erro: ' + errData, { id: loadingToast });
                          }
                        } catch (err) {
                          toast.error('Erro de rede ao testar conexão.', { id: loadingToast });
                        }
                      }}
                      disabled={isWorking}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      Testar Conexão
                    </button>
                    <button
                      type="submit"
                      disabled={isWorking}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Credenciais'}
                    </button>
                  </div>
                </form>
                )}
              </div>
            )}
            {activeTab === 'configure' && extension.id === 'business_info' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 p-4 rounded-xl text-sm border border-blue-200 dark:border-blue-900/50">
                  <p className="font-bold mb-1">Configurações do Meu Negócio</p>
                  <p>Preencha as informações centrais do seu negócio para que sejam exibidas automaticamente no seu site.</p>
                </div>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsWorking(true);
                    const formData = new FormData(e.currentTarget);
                    try {
                      for (let [key, value] of formData.entries()) {
                        await fetch('/api/system/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key, value })
                        });
                      }
                      toast.success('Configurações salvas com sucesso!');
                    } catch (err) {
                      toast.error('Erro ao salvar as configurações.');
                    }
                    setIsWorking(false);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Negócio</label>
                      <input name="business_name" type="text" placeholder="Ex: Acme Corp" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                      <input name="business_cnpj" type="text" placeholder="Ex: 00.000.000/0001-00" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo do Negócio</label>
                      <ImageUploader value={businessLogo} onChange={setBusinessLogo} placeholder="URL ou Upload da Logo" />
                      <input type="hidden" name="business_logo" value={businessLogo} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone / WhatsApp</label>
                      <input name="business_phone" type="text" placeholder="Ex: +55 (11) 99999-9999" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail Comercial</label>
                      <input name="business_email" type="email" placeholder="Ex: contato@acme.com" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instagram</label>
                      <input name="business_instagram" type="url" placeholder="Ex: https://instagram.com/acme" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</label>
                      <input name="business_facebook" type="url" placeholder="Ex: https://facebook.com/acme" className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isWorking}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Informações'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
