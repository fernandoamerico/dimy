'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TitleUpdater } from './TitleUpdater';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dimy_sidebar_collapsed');
        if (saved !== null) {
          return JSON.parse(saved);
        }
      } catch (e) {}
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSetIsSidebarCollapsed = (value: boolean) => {
    setIsSidebarCollapsed(value);
    try {
      localStorage.setItem('dimy_sidebar_collapsed', JSON.stringify(value));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 dark:text-neutral-200 selection:bg-blue-200 dark:selection:bg-emerald-500/30">
      <TitleUpdater />
      <div className="relative">
        <Sidebar 
          isSidebarCollapsed={isSidebarCollapsed} 
          setIsSidebarCollapsed={handleSetIsSidebarCollapsed} 
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
      </div>
      
      <div className="flex flex-col min-h-screen relative">
        <Header 
          isSidebarCollapsed={isSidebarCollapsed} 
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} p-6 pt-10 lg:p-10 lg:pt-14`}>
          {children}
        </main>
      </div>
    </div>
  );
}
