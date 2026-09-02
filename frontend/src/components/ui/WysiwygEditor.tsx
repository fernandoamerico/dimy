'use client';

import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link as LinkIcon, Eraser, Code, Check, X } from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({ value, onChange, placeholder = 'Escreva seu texto aqui...' }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  
  const [linkPopup, setLinkPopup] = useState<{
    visible: boolean;
    url: string;
    newWindow: boolean;
    savedRange: Range | null;
    top: number;
    left: number;
  }>({ visible: false, url: '', newWindow: true, savedRange: null, top: 0, left: 0 });
  
  // Sync value when loading externally or returning from source mode, but NOT while typing
  useEffect(() => {
    if (!isSourceMode && editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isSourceMode]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (editorRef.current) {
      editorRef.current.innerHTML = e.target.value;
    }
  };

  const execCmd = (cmd: string, arg?: string) => {
    if (isSourceMode) return;
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  const openLinkPopup = () => {
    if (isSourceMode) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    // If no text is selected, we could either prevent or allow. Let's allow but maybe it will just insert the URL as text.
    
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    if (editorRect) {
      // Position relative to the editor container
      top = rect.bottom > 0 ? rect.bottom - editorRect.top + 10 : 40;
      left = rect.left > 0 ? rect.left - editorRect.left : 10;
    }

    // Try to find if we are already inside a link
    let existingUrl = '';
    let existingTarget = true;
    let node: any = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'A') {
        existingUrl = node.getAttribute('href') || '';
        existingTarget = node.getAttribute('target') === '_blank';
        break;
      }
      node = node.parentNode;
    }

    setLinkPopup({
      visible: true,
      url: existingUrl,
      newWindow: existingTarget,
      savedRange: range.cloneRange(),
      top,
      left,
    });
  };

  const confirmLink = () => {
    if (!linkPopup.savedRange) return;
    
    // Restore selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(linkPopup.savedRange);
    }

    if (linkPopup.url) {
      // Use a unique marker to find our new link
      const uniqueId = `link-${Date.now()}`;
      document.execCommand("createLink", false, uniqueId);
      
      // Find the link and update its attributes
      if (editorRef.current) {
        const links = editorRef.current.querySelectorAll(`a[href="${uniqueId}"]`);
        links.forEach(link => {
          link.setAttribute('href', linkPopup.url);
          if (linkPopup.newWindow) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          } else {
            link.removeAttribute('target');
            link.removeAttribute('rel');
          }
        });
      }
    } else {
      // If URL is empty, remove link
      document.execCommand("unlink", false);
    }

    handleInput();
    setLinkPopup({ ...linkPopup, visible: false });
    editorRef.current?.focus();
  };

  const cancelLink = () => {
    setLinkPopup({ ...linkPopup, visible: false });
    editorRef.current?.focus();
  };

  return (
    <div className="relative border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 flex flex-col focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-emerald-500 transition-all shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 relative">
        <button type="button" onClick={() => execCmd('bold')} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Negrito">
          <Bold size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('italic')} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Itálico">
          <Italic size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('underline')} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Sublinhado">
          <Underline size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('strikeThrough')} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Riscado">
          <Strikethrough size={16}/>
        </button>
        
        <div className="w-px h-5 bg-gray-300 dark:bg-neutral-700 mx-1"></div>
        
        <button type="button" onClick={() => execCmd('insertUnorderedList')} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Lista com Marcadores">
          <List size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Lista Numerada">
          <ListOrdered size={16}/>
        </button>

        <div className="w-px h-5 bg-gray-300 dark:bg-neutral-700 mx-1"></div>
        
        <button type="button" onClick={openLinkPopup} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Adicionar Link">
          <LinkIcon size={16}/>
        </button>
        <button type="button" onClick={() => execCmd('removeFormat')} disabled={isSourceMode} className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50" title="Limpar Formatação">
          <Eraser size={16}/>
        </button>

        <div className="w-px h-5 bg-gray-300 dark:bg-neutral-700 mx-1"></div>

        <button type="button" onClick={() => setIsSourceMode(!isSourceMode)} className={`p-1.5 rounded transition-colors ${isSourceMode ? 'bg-blue-100 text-blue-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'}`} title="Visualizar Código Fonte">
          <Code size={16}/>
        </button>
      </div>
      
      {/* Link Popup */}
      {linkPopup.visible && (
        <div 
          className="absolute z-10 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl p-3 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 w-[340px]"
          style={{ top: Math.min(linkPopup.top, 200), left: Math.max(10, Math.min(linkPopup.left, 200)) }}
        >
          <div className="flex items-center gap-2">
            <input 
              type="url" 
              placeholder="https://..." 
              value={linkPopup.url}
              onChange={(e) => setLinkPopup({ ...linkPopup, url: e.target.value })}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && confirmLink()}
            />
            <button onClick={confirmLink} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" title="Confirmar">
              <Check size={16} />
            </button>
            <button onClick={cancelLink} className="p-1.5 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors" title="Cancelar">
              <X size={16} />
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={linkPopup.newWindow} 
              onChange={(e) => setLinkPopup({ ...linkPopup, newWindow: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Abrir em nova janela
          </label>
        </div>
      )}

      {/* Editor Area */}
      <div className="relative min-h-[150px] p-4 text-gray-900 dark:text-white bg-white dark:bg-neutral-900 [&_*]:!text-gray-900 [&_*]:dark:!text-white [&_*]:!bg-transparent prose dark:prose-invert max-w-none [&_a]:!text-blue-600 [&_a]:underline hover:[&_a]:!text-blue-700 dark:[&_a]:!text-emerald-400 dark:hover:[&_a]:!text-emerald-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1">
        {isSourceMode ? (
          <textarea
            className="w-full min-h-[150px] bg-transparent resize-y outline-none font-mono text-sm text-gray-800 dark:text-gray-300"
            value={value || ''}
            onChange={handleTextareaChange}
            placeholder={placeholder}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="w-full min-h-[150px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
            data-placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}
