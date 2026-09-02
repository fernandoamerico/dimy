'use client';

import { ImageUploader } from '@/components/ui/ImageUploader';
import { GalleryBlockEditor } from '@/components/ui/GalleryBlockEditor';
import { WysiwygEditor } from '@/components/ui/WysiwygEditor';
import { Trash2, Minus } from 'lucide-react';

interface BlockRendererProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
}

export function BlockRenderer({ field, value, onChange }: BlockRendererProps) {
  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white";

  switch (field.type) {
    case 'text':
      return (
        <input 
          type="text" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)}
          placeholder={`Digite ${field.label.toLowerCase()}...`} 
          className={inputClass} 
        />
      );

    case 'richText':
      return (
        <textarea 
          value={value || ''} 
          onChange={e => onChange(e.target.value)}
          placeholder={`Escreva o conteúdo para ${field.label.toLowerCase()}...`} 
          rows={6} 
          className={`${inputClass} resize-y`} 
        />
      );

    case 'wysiwyg':
      return (
        <WysiwygEditor 
          value={value || ''} 
          onChange={val => onChange(val)} 
          placeholder={`Digite o conteúdo formatado para ${field.label.toLowerCase()}...`}
        />
      );

    case 'image':
      return (
        <div className="flex flex-col gap-3">
          <ImageUploader 
            value={value || ''}
            onChange={url => onChange(url)} 
            placeholder="URL ou Upload da Imagem"
          />
        </div>
      );

    case 'gallery': {
      const rawVal = value;
      const galleryVal = Array.isArray(rawVal) ? rawVal : [];
      return (
        <GalleryBlockEditor
          urls={galleryVal}
          onChange={(urls) => onChange(urls)}
        />
      );
    }

    case 'url':
      return (
        <input 
          type="url" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)}
          onBlur={e => {
            const v = e.target.value.trim();
            if (v && !/^https?:\/\//i.test(v)) onChange(`https://${v}`);
          }}
          placeholder="https://exemplo.com" 
          className={inputClass} 
        />
      );

    case 'table': {
      const rawVal = value;
      const tableVal = Array.isArray(rawVal) ? rawVal : [['', ''], ['', '']];
      return (
        <div className="space-y-3">
          <div className="dark:border dark:border-neutral-700 rounded-xl overflow-hidden dark:shadow-sm bg-white dark:bg-neutral-900">
            <table className="w-full text-sm text-left">
              <tbody>
                {tableVal.map((row: string[], ri: number) => (
                  <tr key={ri} className="border-b border-gray-300 dark:border-neutral-700 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50">
                    {row.map((col: string, ci: number) => (
                      <td key={ci} className="p-0 border-r border-gray-300 dark:border-neutral-700 last:border-r-0 relative">
                        <input type="text" value={col}
                          onChange={e => { const t = tableVal.map((r: string[]) => [...r]); t[ri][ci] = e.target.value; onChange(t); }}
                          className="w-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50/50 dark:focus:bg-emerald-500/10 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-900 dark:text-white text-sm transition-colors" />
                      </td>
                    ))}
                    <td className="p-2 w-10 text-center">
                      <button onClick={() => { if (tableVal.length > 1) { const t = tableVal.filter((_, i) => i !== ri); onChange(t); } }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded disabled:opacity-30" disabled={tableVal.length <= 1}><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4">
            <button onClick={() => onChange([...tableVal, new Array(tableVal[0]?.length || 2).fill('')])}
              className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline flex items-center gap-1">+ Adicionar Linha</button>
            <button onClick={() => onChange(tableVal.map((r: string[]) => [...r, '']))}
              className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline flex items-center gap-1">+ Adicionar Coluna</button>
            <button onClick={() => { if (tableVal[0].length > 1) onChange(tableVal.map((r: string[]) => r.slice(0, -1))) }}
              disabled={tableVal[0].length <= 1} className="text-sm font-medium text-red-500 hover:underline flex items-center gap-1 ml-auto disabled:opacity-30">Remover Coluna</button>
          </div>
        </div>
      );
    }

    case 'button': {
      const rawVal = value;
      const btnVal = (typeof rawVal === 'object' && rawVal !== null && !Array.isArray(rawVal)) ? rawVal : { label: '', url: '' };
      return (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input type="text" value={btnVal.label || btnVal.text || ''} onChange={e => onChange({ ...btnVal, label: e.target.value, text: e.target.value })}
            placeholder="Texto do Botão" className={inputClass} />
          <input type="url" value={btnVal.url || btnVal.href || ''} 
            onChange={e => onChange({ ...btnVal, url: e.target.value, href: e.target.value })}
            onBlur={e => {
              const v = e.target.value.trim();
              if (v && !/^https?:\/\//i.test(v)) onChange({ ...btnVal, url: `https://${v}`, href: `https://${v}` });
            }}
            placeholder="URL de Destino" className={inputClass} />
        </div>
      );
    }

    case 'toggle': {
      const rawVal = value;
      const togVal = rawVal === true || rawVal === 'true';
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(!togVal)}
            className={`w-12 h-6 rounded-full transition-colors relative ${togVal ? 'bg-blue-600 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-neutral-700'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${togVal ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{togVal ? 'Ativado' : 'Desativado'}</span>
        </div>
      );
    }

    case 'select':
    case 'multiselect': {
      const isMulti = field.type === 'multiselect';
      const options = Array.isArray(field.options) ? field.options : [];
      if (options.length === 0) {
        return <p className="text-sm text-gray-500 dark:text-neutral-500 italic">Configure as opções deste campo nas configurações da coleção.</p>;
      }

      if (isMulti) {
        const selectedSet = new Set(Array.isArray(value) ? value : []);
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((opt: string) => {
              const isSelected = selectedSet.has(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const next = new Set(selectedSet);
                    if (next.has(opt)) next.delete(opt);
                    else next.add(opt);
                    onChange(Array.from(next));
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-emerald-500/10 border-blue-200 dark:border-emerald-500/30 text-blue-700 dark:text-emerald-400 font-medium' 
                      : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );
      } else {
        const val = typeof value === 'string' ? value : '';
        return (
          <select
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            <option value="" disabled>Selecione uma opção...</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
    }

    case 'number':
      return (
        <input 
          type="number" 
          value={value ?? ''} 
          onChange={e => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
          placeholder={`0`} 
          className={inputClass} 
        />
      );

    case 'social_links': {
      const rawVal = value;
      const linksVal = Array.isArray(rawVal) ? rawVal : [];
      const platforms = ['Facebook', 'Instagram', 'LinkedIn', 'X / Twitter', 'YouTube', 'TikTok', 'Site', 'Outro'];
      return (
        <div className="space-y-3">
          {linksVal.map((link: any, idx: number) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={link.platform || ''}
                onChange={e => {
                  const newLinks = [...linksVal];
                  newLinks[idx] = { ...newLinks[idx], platform: e.target.value };
                  onChange(newLinks);
                }}
                className={`${inputClass} sm:w-1/3 appearance-none cursor-pointer`}
              >
                <option value="" disabled>Plataforma...</option>
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              
              <div className="flex w-full sm:flex-1 items-center gap-2">
                <input 
                  type="url" 
                  value={link.url || ''} 
                  onChange={e => {
                    const newLinks = [...linksVal];
                    newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                    onChange(newLinks);
                  }}
                  onBlur={e => {
                    const v = e.target.value.trim();
                    if (v && !/^https?:\/\//i.test(v)) {
                      const newLinks = [...linksVal];
                      newLinks[idx] = { ...newLinks[idx], url: `https://${v}` };
                      onChange(newLinks);
                    }
                  }}
                  placeholder="https://..." 
                  className={inputClass} 
                />
                <button 
                  onClick={() => {
                    const newLinks = linksVal.filter((_, i) => i !== idx);
                    onChange(newLinks);
                  }}
                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded shrink-0 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => onChange([...linksVal, { platform: '', url: '' }])}
            className="text-sm font-medium text-blue-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-2"
          >
            + Adicionar Link Social
          </button>
        </div>
      );
    }

    case 'divider':
      return (
        <div className="flex items-center gap-4 py-4 text-slate-400 dark:text-slate-500">
          <div className="flex-1 border-t border-slate-200 dark:border-neutral-700 border-dashed"></div>
          <input 
            type="text" 
            value={typeof value === 'string' ? value : (field.label || 'Divisor')} 
            onChange={e => onChange(e.target.value)}
            className="text-sm font-medium px-2 text-center bg-transparent border-none focus:outline-none w-auto min-w-[100px] text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-colors"
            placeholder="Nome (opcional)"
          />
          <div className="flex-1 border-t border-slate-200 dark:border-neutral-700 border-dashed"></div>
        </div>
      );

    default:
      return (
        <input 
          type="text" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)}
          className={inputClass} 
        />
      );
  }
}
