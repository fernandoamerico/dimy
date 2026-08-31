'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Library, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { toast } from 'sonner';

interface GalleryBlockEditorProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function GalleryBlockEditor({ urls = [], onChange }: GalleryBlockEditorProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (!res.ok) throw new Error('Falha no upload');
        const data = await res.json();
        return data.url;
      });

      const newUrls = await Promise.all(uploadPromises);
      const validUrls = newUrls.filter(url => Boolean(url));
      
      if (validUrls.length > 0) {
        onChange([...urls, ...validUrls]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar as imagens.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {urls.map((url, i) => (
            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
              <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/90 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`w-full ${urls.length === 0 ? 'h-48' : 'p-6'} rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-950/50 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900/50`}>
        {urls.length === 0 && (
          <div className="text-gray-400 mb-2 flex flex-col items-center">
            <ImageIcon className="w-8 h-8 mb-3 opacity-50" />
            <span className="text-sm font-medium">Galeria vazia</span>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
          >
            <Library className="w-4 h-4 text-blue-500" />
            Adicionar da biblioteca
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Enviar imagem
          </button>
        </div>
      </div>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        }}
        accept="image/*"
        className="hidden"
      />

      <MediaLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        isSelectionMode={true}
        onSelectMultiple={(selectedUrls) => {
          const cleaned = urls.filter(u => u.trim() !== '');
          onChange([...cleaned, ...selectedUrls]);
          setIsLibraryOpen(false);
        }}
      />
    </div>
  );
}
