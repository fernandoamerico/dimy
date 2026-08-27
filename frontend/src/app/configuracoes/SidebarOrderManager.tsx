'use client';

import { useState, useEffect } from 'react';
import { getEnabledNavItems, getSidebarOrder, saveSidebarOrder } from '@/core/extensions/actions';
import { getCollections } from '@/core/schema/actions';
import { ArrowUp, ArrowDown, GripVertical, Loader2, CheckCircle2 } from 'lucide-react';

export function SidebarOrderManager() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      const [navs, cols, order] = await Promise.all([
        getEnabledNavItems(),
        getCollections(),
        getSidebarOrder()
      ]);

      const formattedNavs = navs.map((n: any) => ({ id: n.href, label: n.label, type: 'nav' }));
      const formattedCols = cols.map((c: any) => ({ id: `/content/list?slug=${c.slug}`, label: c.name, type: 'col' }));
      
      const combined = [...formattedNavs, ...formattedCols];

      // Sort based on saved order
      if (order && order.length > 0) {
        combined.sort((a, b) => {
          const indexA = order.indexOf(a.id);
          const indexB = order.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1; // Not in order list, goes to bottom
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }

      setItems(combined);
      setIsLoading(false);
    }
    fetchMenu();
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    setItems(newItems);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    const orderToSave = items.map(item => item.id);
    const res = await saveSidebarOrder(orderToSave);
    
    setIsSaving(false);
    
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Opcional: reload the page to refresh the sidebar immediately
      window.location.reload();
    } else {
      alert('Erro ao salvar a ordem do menu.');
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando itens do menu...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-neutral-800 last:border-0 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 rounded-md">
                {item.type === 'nav' ? 'Módulo' : 'Coleção'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-blue-50 dark:hover:bg-emerald-500/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saveSuccess && (
          <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Salvar Ordem
        </button>
      </div>
    </div>
  );
}
