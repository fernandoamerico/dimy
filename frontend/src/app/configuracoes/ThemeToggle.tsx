'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Sparkles, CheckCircle2 } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Evita Hydration Mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 animate-pulse bg-gray-100 dark:bg-neutral-800 rounded-2xl"></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Sistema */}
      <div 
        onClick={() => setTheme('system')}
        className={`relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden bg-gray-50 dark:bg-neutral-900 p-6 ${
          theme === 'system' ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-800'
        }`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-neutral-700">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          {theme === 'system' && <CheckCircle2 className="w-6 h-6 text-indigo-500" />}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sistema</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
          Acompanha o tema do seu sistema operacional.
        </p>

        {/* Mini Preview */}
        <div className="mt-6 border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg p-4 pointer-events-none">
          <div className="flex gap-2">
            <div className="w-1/4 h-24 bg-gray-100 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-md"></div>
            <div className="w-3/4 flex flex-col gap-2">
              <div className="h-6 w-full bg-gray-100 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-md"></div>
              <div className="flex-1 w-full bg-gray-100 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Claro */}
      <div 
        onClick={() => setTheme('light')}
        className={`relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden bg-white p-6 ${
          theme === 'light' ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Sun className="w-6 h-6 text-blue-500" />
          </div>
          {theme === 'light' && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900">Tema Claro</h3>
        <p className="text-sm text-gray-500 mt-1">
          O padrão atual do Dimy. Uma interface limpa, iluminada e focada no conteúdo.
        </p>

        {/* Mini Preview */}
        <div className="mt-6 border border-gray-100 bg-slate-50 rounded-lg p-4 pointer-events-none">
          <div className="flex gap-2">
            <div className="w-1/4 h-24 bg-white border border-gray-200 rounded-md"></div>
            <div className="w-3/4 flex flex-col gap-2">
              <div className="h-6 w-full bg-white border border-gray-200 rounded-md"></div>
              <div className="flex-1 w-full bg-white border border-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Assistente / Dark */}
      <div 
        onClick={() => setTheme('dark')}
        className={`relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden bg-neutral-950 p-6 ${
          theme === 'dark' ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-neutral-800 hover:border-emerald-800'
        }`}
      >
        {/* Glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800 shadow-inner">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          {theme === 'dark' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
        </div>
        
        <h3 className="text-lg font-semibold text-white relative z-10">Tema Assistente</h3>
        <p className="text-sm text-neutral-400 mt-1 relative z-10">
          Estilo "Wizard". Interface escura com tons neutros profundos e efeitos neon brilhantes.
        </p>

        {/* Mini Preview */}
        <div className="mt-6 border border-neutral-800 bg-neutral-950 rounded-lg p-4 pointer-events-none relative z-10">
          <div className="flex gap-2">
            <div className="w-1/4 h-24 bg-neutral-900/60 border border-neutral-800 rounded-md"></div>
            <div className="w-3/4 flex flex-col gap-2">
              <div className="h-6 w-full bg-neutral-900/60 border border-neutral-800 rounded-md"></div>
              <div className="flex-1 w-full bg-neutral-900/60 border border-neutral-800 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
