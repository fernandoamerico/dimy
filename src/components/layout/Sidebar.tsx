'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Layers
} from 'lucide-react';
import { adimyConfig } from '@/adimy.config';

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
  const [dynamicCollections, setDynamicCollections] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCollections() {
      const cols = await getCollections();
      setDynamicCollections(cols);
    }
    fetchCollections();
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

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white/60 backdrop-blur-md border-r border-slate-200/50 text-gray-600 transition-transform duration-300 ease-in-out lg:transition-all ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'w-64'}`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-4 shrink-0 justify-between">
          {!isSidebarCollapsed && (
            <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
              Adimy<span className="text-blue-600">.</span>
            </Link>
          )}
          
          {/* Botão de Fechar no Mobile */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <X strokeWidth={2} className="w-5 h-5" />
          </button>

          {/* Botão de Collapse no Desktop */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`hidden lg:block p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-600/10 transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
          >
            {isSidebarCollapsed ? <PanelLeftOpen strokeWidth={1.5} className="w-5 h-5" /> : <PanelLeftClose strokeWidth={1.5} className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 pl-3 pr-0 overflow-visible">
          {!isSidebarCollapsed && <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Menu Principal</div>}
          {adimyConfig.navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`group relative flex items-center gap-2 pl-3 pr-4 py-2 rounded-l-xl rounded-r-none text-[16px] font-normal transition-all mb-0.5 ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-600' 
                    : 'text-gray-900 hover:text-blue-600 hover:bg-gray-50/50'
                } ${isSidebarCollapsed ? 'justify-center pr-3 rounded-xl mr-3' : ''}`}
              >
                <item.icon strokeWidth={1.5} className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                
                {/* Custom Tooltip */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-[13px] font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-gray-800 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-gray-900">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}

          {dynamicCollections.length > 0 && (
            <>
              {!isSidebarCollapsed && <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-3">Conteúdo Dinâmico</div>}
              {dynamicCollections.map((col) => {
                const href = `/content/${col.slug}`;
                const isActive = pathname?.startsWith(href);
                return (
                  <Link
                    key={col.id}
                    href={href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`group relative flex items-center gap-2 pl-3 pr-4 py-2 rounded-l-xl rounded-r-none text-[16px] font-normal transition-all mb-0.5 ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-600' 
                        : 'text-gray-900 hover:text-blue-600 hover:bg-gray-50/50'
                    } ${isSidebarCollapsed ? 'justify-center pr-3 rounded-xl mr-3' : ''}`}
                  >
                    <Layers strokeWidth={1.5} className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`} />
                    {!isSidebarCollapsed && <span className="truncate">{col.name}</span>}
                    
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-[13px] font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-gray-800 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-gray-900">
                        {col.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>


      </aside>
    </>
  );
}
