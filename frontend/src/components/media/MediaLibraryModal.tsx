'use client';

import { useState, useEffect, useRef } from 'react';
import { getMediaFiles, updateMediaFile, deleteMediaFile } from '@/core/media/actions';
import type { MediaFile } from '@/core/media/actions';
import { X, UploadCloud, Search, File, Trash, Loader2, Image as ImageIcon } from 'lucide-react';

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
  isSelectionMode?: boolean;
  isModal?: boolean;
}

export function MediaLibraryModal({ 
  isOpen = true, 
  onClose, 
  onSelect, 
  isSelectionMode = true,
  isModal = true 
}: MediaLibraryModalProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [search, setSearch] = useState('');
  const [mimeType, setMimeType] = useState('all');

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
    }
  }, [isOpen, search, mimeType]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Falha no upload');
      await fetchMedia(); // refresh list
    } catch (e) {
      alert('Erro ao enviar arquivo.');
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
    // Optimistic UI, no need to refresh entire list just for alt/comment
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    if (confirm('Tem certeza que deseja apagar este arquivo permanentemente?')) {
      await deleteMediaFile(selectedFile.id);
      setSelectedFile(null);
      fetchMedia();
    }
  };

  if (isModal && !isOpen) return null;

  const content = (
    <div className={`w-full flex flex-col ${isModal ? 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden' : 'bg-transparent min-h-[500px] h-[calc(100vh-14rem)]'}`}>
      
      {/* Header */}
      {isModal && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Biblioteca de Mídia</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

        {/* Toolbar */}
        {mediaFiles.length > 0 && (
          <div className={`${isModal ? 'px-6 py-3 bg-gray-50/50 dark:bg-neutral-900/50 border-b border-gray-100 dark:border-neutral-800/50' : 'py-3'} flex flex-wrap items-center gap-4`}>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Enviar Arquivo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files.item(0);
                    if (file) handleUpload(file);
                  }
                }}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 flex justify-end gap-3">
              <select
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="all">Todos os tipos</option>
                <option value="image">Imagens</option>
                <option value="document">Documentos</option>
              </select>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Buscar arquivo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 text-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Grid */}
          <div className={`flex-1 overflow-y-auto ${isModal ? 'p-6' : 'py-6'}`}>
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className={`flex w-full ${isModal ? 'h-full p-4 items-center justify-center' : 'mt-4'}`}>
                <div className="w-full flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
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
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {mediaFiles.map((file) => (
                  <div 
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`group relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer bg-gray-50 dark:bg-neutral-800 ${
                      selectedFile?.id === file.id 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : 'border-transparent hover:border-blue-200 dark:hover:border-neutral-700'
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar Details */}
          {selectedFile && (
            <div className="w-80 border-l border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 flex flex-col">
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm text-gray-600 dark:text-neutral-400">
                
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Detalhes do Arquivo</h3>
                
                <div className="aspect-video bg-gray-200 dark:bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {selectedFile.mime_type.startsWith('image/') ? (
                    <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-full object-contain" />
                  ) : (
                    <File className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <p><strong className="text-gray-900 dark:text-gray-200">Nome:</strong> {selectedFile.name}</p>
                  <p><strong className="text-gray-900 dark:text-gray-200">Data:</strong> {new Date(selectedFile.created_at).toLocaleDateString()}</p>
                  <p><strong className="text-gray-900 dark:text-gray-200">Tamanho:</strong> {formatSize(selectedFile.size)}</p>
                  {selectedFile.dimensions && (
                    <p><strong className="text-gray-900 dark:text-gray-200">Dimensões:</strong> {selectedFile.dimensions}</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 dark:text-gray-200 mb-1">Texto Alternativo (Alt)</label>
                    <input 
                      type="text"
                      value={selectedFile.alt}
                      onChange={(e) => setSelectedFile({...selectedFile, alt: e.target.value})}
                      onBlur={handleUpdate}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                      placeholder="Descreva a imagem..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 dark:text-gray-200 mb-1">Comentário / Legenda</label>
                    <textarea 
                      value={selectedFile.comment}
                      onChange={(e) => setSelectedFile({...selectedFile, comment: e.target.value})}
                      onBlur={handleUpdate}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white resize-none"
                      rows={3}
                      placeholder="Adicione uma legenda..."
                    />
                  </div>
                </div>

                <button 
                  onClick={handleDelete}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  Excluir Permanentemente
                </button>
              </div>
              
              {/* Footer Actions */}
              {isSelectionMode && (
                <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <button
                    onClick={() => {
                      if(onSelect) onSelect(selectedFile.url);
                      if(onClose) onClose();
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Inserir Mídia
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {content}
    </div>
  );
}
