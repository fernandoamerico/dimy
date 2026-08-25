'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950 font-sans text-slate-900 dark:text-neutral-200 selection:bg-blue-200 dark:selection:bg-emerald-500/30">
      {/* Background Mesh Gradient Efeito Fluent/Microsoft - Light Mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 dark:hidden">
        {/* Pink/Purple blend vindo do canto inferior direito e subindo */}
        <div className="absolute -bottom-[30%] -right-[10%] w-[80%] h-[80%] rounded-[100%] bg-gradient-to-tl from-pink-400/70 via-purple-400/40 to-transparent blur-[100px] opacity-100" />
        
        {/* Cyan/Blue blend vindo da esquerda */}
        <div className="absolute top-[0%] -left-[10%] w-[60%] h-[70%] rounded-[100%] bg-gradient-to-br from-cyan-300/50 via-blue-400/30 to-transparent blur-[120px] opacity-80" />
        
        {/* Soft Blue no meio para conectar o rosa e o verde */}
        <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] rounded-[100%] bg-blue-300/30 blur-[100px] opacity-60" />
      </div>

      {/* Background Glows - Dark Theme (Wizard Style) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden dark:block">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-20">
        <Sidebar 
          isSidebarCollapsed={isSidebarCollapsed} 
          setIsSidebarCollapsed={setIsSidebarCollapsed} 
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
      </div>
      
      <div className="flex flex-col min-h-screen relative z-10">
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
