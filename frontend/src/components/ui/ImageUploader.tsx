'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUploader({ value, onChange, placeholder = "URL da imagem", className = "" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
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
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LinkIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="shrink-0 p-2 text-gray-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-emerald-400 bg-gray-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-emerald-500/20 disabled:opacity-50"
        title="Fazer Upload do Computador"
      >
        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
          }
        }}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
