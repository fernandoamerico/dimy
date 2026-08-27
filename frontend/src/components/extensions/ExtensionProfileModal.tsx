'use client';

import { useState } from 'react';
import { X, Star, Download, ChevronRight, ShieldAlert, User, Clock, CheckCircle2, MessageSquare, Loader2, Power, Trash2, Image as ImageIcon } from 'lucide-react';
import { StoreExtension } from '@/core/extensions/storeMock';
import { getExtensionsStatus, installExtension, toggleExtension, uninstallExtension } from '@/core/extensions/actions';

interface ExtensionProfileModalProps {
  extension: StoreExtension;
  localStatus?: any; // The status from getExtensionsStatus (isInstalled, isEnabled, isEssential)
  onClose: () => void;
  onRefresh: () => void;
}

export function ExtensionProfileModal({ extension, localStatus, onClose, onRefresh }: ExtensionProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [isWorking, setIsWorking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // For uninstall modal inside profile
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [uninstallError, setUninstallError] = useState('');

  const isFakeStoreExtension = extension.id.startsWith('store_');

  const handleInstall = async () => {
    if (isFakeStoreExtension) {
      alert('Este é um aplicativo fictício de demonstração da Loja. Na versão final, ele seria instalado!');
      return;
    }
    
    setIsWorking(true);
    const res = await installExtension(extension.id);
    if (res.success) {
      onRefresh();
    } else {
      alert('Erro: ' + res.error);
    }
    setIsWorking(false);
  };

  const handleToggle = async () => {
    if (!localStatus) return;
    if (localStatus.isEnabled && localStatus.isEssential) {
      alert('Este aplicativo é essencial e não pode ser desativado.');
      return;
    }

    setIsWorking(true);
    const res = await toggleExtension(extension.id, !localStatus.isEnabled);
    if (res.success) {
      onRefresh();
    } else {
      alert('Erro: ' + res.error);
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
              <div className="flex items-center gap-3 mt-2">
                {localStatus?.isInstalled ? (
                  <>
                    <button
                      onClick={handleToggle}
                      disabled={isWorking || localStatus.isEssential}
                      className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 ${
                        localStatus.isEnabled
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30'
                      } ${localStatus.isEssential ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Power className="w-4 h-4" />
                      {localStatus.isEnabled ? 'Desativar' : 'Ativar'}
                    </button>
                    {!localStatus.isEssential && (
                      <button
                        onClick={() => setShowUninstallConfirm(true)}
                        disabled={isWorking}
                        className="px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleInstall}
                    disabled={isWorking}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Instalar
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
          </div>
        </div>
      </div>
    </div>
  );
}
