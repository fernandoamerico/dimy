'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCollections } from '@/core/schema/actions';
import { 
  LayoutDashboard, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  ChevronRight,
  Hash,
  Globe,
  CalendarDays,
  Users,
  X,
  Database,
  Layers,
  Newspaper,
  Briefcase,
  FileText,
  Package,
  Images
} from 'lucide-react';
import { dimyConfig } from '@/dimy.config';

import { useTranslation } from 'react-i18next';

export function Sidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [combinedNavItems, setCombinedNavItems] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      // Import here to avoid circular dependency issues if any
      const { getEnabledNavItems, getSidebarOrder } = await import('@/core/extensions/actions');
      const [cols, navs, order] = await Promise.all([
        getCollections(),
        getEnabledNavItems(),
        getSidebarOrder()
      ]);
      
      const formattedNavs = navs.map((n: any) => ({ ...n, id: n.href, type: 'nav' }));
      
      // Filter out page collections and publications that don't have show_in_sidebar enabled
      const visibleCols = cols.filter((c: any) => {
        if (!c.metadata) return false; // If no metadata, hide by default since it might be a page/category
        try {
          const meta = JSON.parse(c.metadata);
          if (meta.is_product) return true; // Keep products visible by default (if they exist)
          
          if ((meta.is_page || meta.is_publication || meta.is_banner) && !meta.show_in_sidebar) {
            return false;
          }
          if (meta.hide_from_sidebar) return false;
        } catch (e) {}
        return true;
      });
      
      const formattedCols = visibleCols.map((c: any) => {
        let isProduct = false;
        let isPublication = false;
        try {
          const meta = JSON.parse(c.metadata);
          isProduct = meta.is_product === true;
          isPublication = meta.is_publication === true;
        } catch (e) {}
        
        let baseUrl = '/content/list';
        if (isProduct) baseUrl = '/produtos/lista';
        else if (isPublication) baseUrl = '/publicacoes/list';

        return { 
          ...c, 
          id: `${baseUrl}?slug=${c.slug}`, 
          href: `${baseUrl}?slug=${c.slug}`, 
          label: c.name, 
          iconName: isProduct ? 'Package' : (isPublication ? 'Newspaper' : 'Layers'), 
          type: 'col' 
        };
      });
      
      const combined = [...formattedNavs, ...formattedCols];

      if (order && order.length > 0) {
        combined.sort((a, b) => {
          const indexA = order.indexOf(a.id);
          const indexB = order.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }

      setCombinedNavItems(combined);
    }
    fetchData();
  }, []);

  return (
    <>
      {/* Overlay para Mobile (efeito blur geral quando aberto) */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-r border-slate-200/50 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 transition-transform duration-300 ease-in-out lg:transition-all ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'w-64'}`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-4 shrink-0 justify-between">
          {!isSidebarCollapsed && (
            <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dimy<span className="text-blue-600 dark:text-emerald-400">.</span>
            </Link>
          )}
          
          {/* Botão de Fechar no Mobile */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X strokeWidth={2} className="w-5 h-5" />
          </button>

          {/* Botão de Collapse no Desktop */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`hidden lg:block p-2 rounded-md text-gray-500 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-blue-600/10 dark:hover:bg-neutral-800 transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
          >
            {isSidebarCollapsed ? <PanelLeftOpen strokeWidth={1.5} className="w-5 h-5" /> : <PanelLeftClose strokeWidth={1.5} className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 pl-3 pr-0 overflow-visible">
          {!isSidebarCollapsed && <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Menu Principal</div>}
          {combinedNavItems.map((item) => {
            const currentSlug = searchParams.get('slug');
            let isActive = false;
            
            if (item.href === '/') {
              isActive = pathname === '/';
            } else if (item.type === 'col') {
              // Extrai o slug do href (ex: /produtos/lista?slug=passeios)
              const itemSlug = new URLSearchParams(item.href.split('?')[1]).get('slug');
              isActive = currentSlug === itemSlug;
            } else {
              // Item genérico (ex: /produtos). Fica ativo apenas se não estivermos dentro de uma coleção específica.
              if (item.href === '/banners') {
                isActive = !!pathname?.startsWith('/banners');
              } else {
                isActive = !!pathname?.startsWith(item.href) && !currentSlug;
              }
            }
            
            // Map icon string to Lucide component
            const iconsMap: any = { LayoutDashboard, Settings, Blocks: Layers, Newspaper, Layers, Briefcase, FileText, Package, Images };
            const IconComponent = iconsMap[item.iconName] || Folder;
            
            let displayLabel = item.label;
            if (item.href === '/') displayLabel = t('sidebar.dashboard');
            else if (item.href === '/aplicativos') displayLabel = t('sidebar.apps');
            else if (item.href === '/configuracoes') displayLabel = t('sidebar.settings');

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`group relative flex items-center gap-2 pl-3 pr-4 py-2 rounded-l-xl rounded-r-none text-[16px] font-normal transition-all mb-0.5 ${
                  isActive 
                    ? 'bg-blue-600/10 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400' 
                    : 'text-gray-900 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-neutral-800'
                } ${isSidebarCollapsed ? 'justify-center pr-3 rounded-xl mr-3' : ''}`}
              >
                <IconComponent strokeWidth={1.5} className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-blue-600 dark:text-emerald-400' : 'text-gray-900 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-white'}`} />
                {!isSidebarCollapsed && <span className="truncate">{displayLabel}</span>}
                
                {/* Custom Tooltip */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-[13px] font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-gray-800 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-gray-900">
                    {displayLabel}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>


      </aside>
    </>
  );
}
