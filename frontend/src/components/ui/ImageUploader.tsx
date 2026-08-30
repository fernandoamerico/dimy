'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Loader2, Library, Trash2, Image as ImageIcon } from 'lucide-react';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  layout?: 'row' | 'col';
}

export function ImageUploader({ value, onChange, placeholder = "URL da imagem", className = "", layout = 'row' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Falha no upload');
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {value ? (
        <div className="w-full h-48 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50 dark:bg-neutral-950 relative group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
            title="Remover imagem"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-full min-h-[128px] py-6 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-950/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900/50 px-4 text-gray-400">
          <ImageIcon className="w-8 h-8 mb-4 opacity-40" />
          <div className={`flex items-center justify-center gap-3 w-full ${layout === 'col' ? 'flex-col' : 'flex-row flex-wrap'}`}>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
            >
              <Library className="w-4 h-4 text-blue-500" />
              Adicionar da biblioteca
            </button>
            <span className="text-gray-400 text-sm font-medium">ou</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Enviar imagem
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files.item(0);
            if (file) handleUpload(file);
          }
        }}
        accept="image/*"
        className="hidden"
      />
      <MediaLibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        isSelectionMode={true}
        onSelect={(url) => {
          onChange(url);
          setIsLibraryOpen(false);
        }}
      />
    </div>
  );
}
