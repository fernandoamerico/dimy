'use client';

import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({ value, onChange, placeholder = 'Escreva seu texto aqui...' }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Set initial value only once to prevent cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 flex flex-col focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-emerald-500 transition-all shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950">
        <button type="button" onClick={() => execCmd('bold')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors" title="Negrito">
          <Bold size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('italic')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors" title="Itálico">
          <Italic size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('underline')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors" title="Sublinhado">
          <Underline size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('strikeThrough')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors" title="Riscado">
          <Strikethrough size={16}/>
        </button>
        
        <div className="w-px h-5 bg-gray-300 dark:bg-neutral-700 mx-1"></div>
        
        <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors" title="Lista com Marcadores">
          <List size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors" title="Lista Numerada">
          <ListOrdered size={16}/>
        </button>
      </div>
      
      {/* Editor ContentEditable */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="p-4 min-h-[200px] outline-none text-base text-gray-900 dark:text-white empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 prose dark:prose-invert max-w-none"
      />
    </div>
  );
}
