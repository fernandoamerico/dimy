'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Settings, LogOut, Menu, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/core/api';

export function Header({ 
  isSidebarCollapsed,
  setIsMobileSidebarOpen 
}: { 
  isSidebarCollapsed: boolean;
  setIsMobileSidebarOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const getTitle = () => {
    if (pathname === '/') return 'Visão Geral';
    if (pathname?.startsWith('/modulo')) return 'Módulo';
    if (pathname?.startsWith('/equipe')) return 'Equipe';
    if (pathname?.startsWith('/configuracoes')) return 'Configurações';
    return 'Dashboard';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`h-16 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} sticky top-0 z-30 transition-all duration-300 ease-in-out border-b border-slate-200/50 dark:border-neutral-800`}>
      
      {/* Mobile Menu Button (Left) */}
      <div className="flex items-center lg:hidden">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-emerald-400 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Title & Logo (Center on Mobile, Left on Desktop) */}
      <div className="flex-1 flex items-center justify-center lg:justify-start lg:flex-none">
        <Link href="/" className="lg:hidden text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dimy<span className="text-blue-600 dark:text-emerald-400">.</span>
        </Link>
        <h1 className="hidden lg:block text-lg font-semibold text-gray-800 dark:text-neutral-100">{getTitle()}</h1>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center justify-end gap-3 lg:gap-4 flex-none">
        <div className="hidden md:flex relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="pl-9 pr-4 py-2 bg-gray-50/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-neutral-700/50 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-neutral-900 transition-all w-64"
          />
        </div>

        <button className="relative p-2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors hidden sm:block">
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-neutral-800 mx-1 hidden sm:block"></div>

        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-700 dark:text-neutral-200">Administrador</div>
              <div className="text-xs text-gray-500 dark:text-neutral-400">Dimy</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-neutral-800 flex items-center justify-center text-blue-700 dark:text-emerald-400 font-bold border border-blue-200 dark:border-neutral-700 hover:ring-2 hover:ring-blue-100 dark:hover:ring-neutral-700 transition-all">
              AD
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link 
                href="/perfil" 
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                Meu Perfil
              </Link>
              
              <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1"></div>
              
              <form onSubmit={async (e) => { e.preventDefault(); await logout(); window.location.href = '/login'; }}>
                <button 
                  type="submit"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
