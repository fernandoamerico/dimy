'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagSelector({ value = [], onChange, placeholder = "Pressione Enter para adicionar" }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="w-full min-h-[46px] p-1.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-emerald-500 transition-all flex flex-wrap gap-2 items-center text-sm">
      {value.map(tag => (
        <span 
          key={tag} 
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg text-xs font-semibold uppercase tracking-wider"
        >
          {tag}
          <button 
            type="button" 
            onClick={() => removeTag(tag)}
            className="hover:text-blue-900 dark:hover:text-emerald-200 focus:outline-none"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : "Adicionar..."}
        className="flex-1 min-w-[120px] bg-transparent focus:outline-none px-2 py-1 text-gray-900 dark:text-white placeholder-gray-400"
      />
    </div>
  );
}
