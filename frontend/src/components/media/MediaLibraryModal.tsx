'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getMediaFiles, updateMediaFile, deleteMediaFile } from '@/core/media/actions';
import type { MediaFile } from '@/core/media/actions';
import { X, UploadCloud, Search, File, Trash, Loader2, Image as ImageIcon, CheckSquare, Square, Trash2 } from 'lucide-react';

// Helper to format sizes
function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface MediaLibraryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelect?: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  isSelectionMode?: boolean;
  isModal?: boolean;
}

export function MediaLibraryModal({ 
  isOpen = true, 
  onClose, 
  onSelect, 
  onSelectMultiple,
  isSelectionMode = false,
  isModal = true 
}: MediaLibraryModalProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [mimeType, setMimeType] = useState('all');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'bulk' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    const { data } = await getMediaFiles({ search, mimeType });
    setMediaFiles(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      if (onSelectMultiple) {
        setIsMultiSelectMode(true);
      }
    }
  }, [isOpen, search, mimeType, onSelectMultiple]);

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Falha no upload: ${file.name}`);
      });
      await Promise.all(uploadPromises);
      await fetchMedia();
    } catch (e) {
      alert('Erro ao enviar um ou mais arquivos.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) return;
    await updateMediaFile(selectedFile.id, {
      alt: selectedFile.alt,
      comment: selectedFile.comment
    });
  };

  const handleDelete = () => {
    if (!selectedFile) return;
    setDeleteTarget('single');
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteTarget('bulk');
  };

  const executeDelete = async () => {
    if (deleteTarget === 'single' && selectedFile) {
      await deleteMediaFile(selectedFile.id);
      setSelectedFile(null);
      fetchMedia();
    } else if (deleteTarget === 'bulk' && selectedIds.size > 0) {
      setIsDeletingBulk(true);
      try {
        await Promise.all(Array.from(selectedIds).map(id => deleteMediaFile(id)));
        setSelectedIds(new Set());
        setIsMultiSelectMode(false);
        setSelectedFile(null);
        await fetchMedia();
      } catch (e) {
        alert('Erro ao apagar alguns arquivos.');
      } finally {
        setIsDeletingBulk(false);
      }
    }
    setDeleteTarget(null);
  };

  const handleBulkSelect = () => {
    if (onSelectMultiple && selectedIds.size > 0) {
      const urls = Array.from(selectedIds)
        .map(id => mediaFiles.find(mf => mf.id === id)?.url)
        .filter((url): url is string => !!url);
      onSelectMultiple(urls);
      setSelectedIds(new Set());
      setIsMultiSelectMode(false);
    }
  };

  const toggleFileSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFileClick = (file: MediaFile) => {
    if (isMultiSelectMode) {
      toggleFileSelection(file.id);
      setSelectedFile(file); // Show details in sidebar even when multi-selecting
    } else {
      setSelectedFile(prev => prev?.id === file.id ? null : file);
    }
  };

  const exitMultiSelect = () => {
    setIsMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  const selectAll = () => {
    setSelectedIds(new Set(mediaFiles.map(f => f.id)));
  };

  if (isModal && !isOpen) return null;

  // Shared glass classes for page mode panels
  const glassPanel = 'bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-white/60 dark:border-neutral-700/50 rounded-3xl shadow-sm';
  const inputClass = (modal: boolean) => modal
    ? 'border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white'
    : 'border border-white/50 dark:border-neutral-700/50 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm';

  const content = (
    <div className={`w-full flex flex-col ${isModal
      ? 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden'
      : 'bg-transparent min-h-[500px] h-[calc(100vh-14rem)]'
    }`}>

      {/* Modal Header */}
      {isModal && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Biblioteca de Mídia</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleUpload(e.target.files);
        }}
        className="hidden"
      />

      {/* Toolbar */}
      {mediaFiles.length > 0 && (
        <div className={`flex flex-wrap items-center gap-3 ${isModal ? 'px-6 py-3 bg-gray-50/50 dark:bg-neutral-900/50 border-b border-gray-100 dark:border-neutral-800/50' : 'py-3'}`}>
          {isMultiSelectMode ? (
            // Multi-select toolbar
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Enviar
              </button>
              
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                {selectedIds.size} selecionado(s)
              </span>
              <button onClick={selectAll} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Selecionar todos
              </button>
              {!isSelectionMode && (
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0 || isDeletingBulk}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isDeletingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Excluir Selecionados
                </button>
              )}
              <button
                onClick={exitMultiSelect}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors ml-auto"
              >
                Cancelar
              </button>
              {onSelectMultiple && (
                <button
                  onClick={handleBulkSelect}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  Inserir {selectedIds.size} {selectedIds.size === 1 ? 'imagem' : 'imagens'}
                </button>
              )}
            </>
          ) : (
            // Normal toolbar
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  Enviar Arquivo
                </button>
                {(!isSelectionMode || !!onSelectMultiple) && (
                  <button
                    onClick={() => { setIsMultiSelectMode(true); setSelectedFile(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isModal ? 'bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200' : 'bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md border border-white/40 dark:border-neutral-700/50 text-gray-700 dark:text-gray-200 hover:shadow-md'}`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    {onSelectMultiple ? 'Selecionar Várias' : 'Selecionar'}
                  </button>
                )}
              </div>

              <div className="flex-1 flex justify-end gap-3">
                <select
                  value={mimeType}
                  onChange={(e) => setMimeType(e.target.value)}
                  className={`px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none transition-shadow ${isModal ? 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg' : 'bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md border border-white/40 dark:border-neutral-700/50 rounded-xl shadow-sm hover:shadow-md'}`}
                >
                  <option value="all">Todos os tipos</option>
                  <option value="image">Imagens</option>
                  <option value="document">Documentos</option>
                </select>
                <div className="relative group">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar arquivo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 text-gray-700 dark:text-gray-200 transition-shadow ${isModal ? 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg' : 'bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md border border-white/40 dark:border-neutral-700/50 rounded-xl shadow-sm hover:shadow-md'}`}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content Area: grid + sidebar side by side, same height */}
      <div className={`flex-1 flex overflow-hidden min-h-0 ${isModal ? 'px-0' : 'gap-6 py-6'}`}>

        {/* Main Grid */}
        <div className={`flex-1 overflow-y-auto min-w-0 ${isModal ? 'p-6' : ''}`}>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 h-full">
              <div className="w-20 h-20 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Nenhuma mídia encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                Você ainda não enviou nenhum arquivo. Faça o upload da sua primeira imagem ou documento para popular a biblioteca.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                Fazer Upload Agora
              </button>
            </div>
          ) : (
            <div className={isModal ? '' : `${glassPanel} p-6`}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {mediaFiles.map((file) => {
                  const isChecked = selectedIds.has(file.id);
                  const isActive = !isMultiSelectMode && selectedFile?.id === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleFileClick(file)}
                      className={`group relative aspect-square overflow-hidden cursor-pointer transition-all ${
                        isModal
                          ? 'rounded-xl border-2 bg-gray-50 dark:bg-neutral-800'
                          : 'rounded-2xl border bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm shadow-sm hover:shadow-md'
                      } ${
                        isActive || isChecked
                          ? 'border-blue-500 ring-4 ring-blue-500/20'
                          : isModal
                            ? 'border-transparent hover:border-blue-200 dark:hover:border-neutral-700'
                            : 'border-white/50 dark:border-neutral-700/50 hover:border-blue-300 dark:hover:border-blue-500/50'
                      }`}
                    >
                      {file.mime_type.startsWith('image/') ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <File className="w-8 h-8 mb-2" />
                          <span className="text-xs max-w-[80%] truncate">{file.name}</span>
                        </div>
                      )}
                      {/* Checkbox overlay in multi-select mode */}
                      {isMultiSelectMode && (
                        <div className={`absolute inset-0 flex items-start justify-start p-2 transition-all ${isChecked ? 'bg-blue-500/20' : 'bg-transparent group-hover:bg-black/10'}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white/80 border-gray-300'}`}>
                            {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar — same height as grid area */}
        {selectedFile && (
          <div className={`w-80 flex-shrink-0 flex flex-col overflow-hidden ${isModal
            ? 'border-l border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50'
            : glassPanel
          }`}>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-gray-600 dark:text-neutral-400">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Detalhes do Arquivo</h3>

              <div className={`aspect-video rounded-xl overflow-hidden flex items-center justify-center ${isModal ? 'bg-gray-200 dark:bg-neutral-800' : 'bg-white/50 dark:bg-neutral-800/50 shadow-inner'}`}>
                {selectedFile.mime_type.startsWith('image/') ? (
                  <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-full object-contain" />
                ) : (
                  <File className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p><strong className="text-gray-900 dark:text-gray-200">Nome:</strong> {selectedFile.name}</p>
                <p><strong className="text-gray-900 dark:text-gray-200">Data:</strong> {new Date(selectedFile.created_at).toLocaleDateString()}</p>
                <p><strong className="text-gray-900 dark:text-gray-200">Tamanho:</strong> {formatSize(selectedFile.size)}</p>
                {selectedFile.dimensions && (
                  <p><strong className="text-gray-900 dark:text-gray-200">Dimensões:</strong> {selectedFile.dimensions}</p>
                )}
              </div>

              <div className={`space-y-4 pt-4 border-t ${isModal ? 'border-gray-200 dark:border-neutral-800' : 'border-gray-200/50 dark:border-neutral-700/50'}`}>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 dark:text-gray-200 mb-1.5">Texto Alternativo (Alt)</label>
                  <input
                    type="text"
                    value={selectedFile.alt}
                    onChange={(e) => setSelectedFile({...selectedFile, alt: e.target.value})}
                    onBlur={handleUpdate}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${inputClass(isModal)}`}
                    placeholder="Descreva a imagem..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 dark:text-gray-200 mb-1.5">Comentário / Legenda</label>
                  <textarea
                    value={selectedFile.comment}
                    onChange={(e) => setSelectedFile({...selectedFile, comment: e.target.value})}
                    onBlur={handleUpdate}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none ${inputClass(isModal)}`}
                    placeholder="Adicione uma legenda..."
                  />
                </div>
              </div>

              {!isSelectionMode && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  Excluir Permanentemente
                </button>
              )}
            </div>

            {/* Insert button for selection mode */}
            {isSelectionMode && !isMultiSelectMode && (
              <div className={`p-5 border-t flex-shrink-0 ${isModal ? 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900' : 'border-gray-200/50 dark:border-neutral-700/50 bg-white/40 dark:bg-neutral-800/40 backdrop-blur-md'}`}>
                <button
                  onClick={() => {
                    if (onSelect) onSelect(selectedFile.url);
                    if (onClose) onClose();
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md text-white font-medium rounded-xl transition-all"
                >
                  Inserir Mídia
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Excluir {deleteTarget === 'bulk' ? `${selectedIds.size} Arquivos` : 'Arquivo'}?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tem certeza que deseja apagar permanentemente {deleteTarget === 'bulk' ? `esses ${selectedIds.size} arquivos` : `o arquivo "${selectedFile?.name}"`}? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-950/50 border-t border-slate-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeletingBulk}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={executeDelete} disabled={isDeletingBulk} autoFocus
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900">
                {isDeletingBulk ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );

  if (!isModal) {
    return content;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
      {content}
    </div>,
    document.body
  );
}
