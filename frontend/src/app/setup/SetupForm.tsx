'use client'

import { useState } from 'react'
import { setupAdmin } from '@/core/api'

export function SetupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const [databaseType, setDatabaseType] = useState('sqlite')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    const result = await setupAdmin(data)
    
    if (result.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">Nome do Projeto</label>
        <input 
          type="text" 
          name="projectName"
          placeholder="Meu Site Incrível"
          required
          className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
      </div>

      <hr className="border-slate-200 dark:border-neutral-800 my-4 transition-colors" />

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">Banco de Dados</label>
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="databaseType" 
              value="sqlite" 
              checked={databaseType === 'sqlite'}
              onChange={(e) => setDatabaseType(e.target.value)}
              className="accent-emerald-500"
            />
            <span className="text-sm text-slate-700 dark:text-neutral-300">SQLite (Local)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="databaseType" 
              value="postgres" 
              checked={databaseType === 'postgres'}
              onChange={(e) => setDatabaseType(e.target.value)}
              className="accent-emerald-500"
            />
            <span className="text-sm text-slate-700 dark:text-neutral-300">Supabase (PostgreSQL)</span>
          </label>
        </div>

        {databaseType === 'postgres' && (
          <div className="space-y-1 mt-3">
            <label className="text-xs font-medium text-slate-500 dark:text-neutral-400 ml-1">DATABASE_URL (Connection String)</label>
            <input 
              type="text" 
              name="databaseUrl"
              placeholder="postgres://postgres:senha@aws-0...pooler.supabase.com:6543/postgres"
              required={databaseType === 'postgres'}
              className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-mono"
            />
          </div>
        )}
      </div>

      <hr className="border-slate-200 dark:border-neutral-800 my-4 transition-colors" />

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">Nome do Administrador</label>
        <input 
          type="text" 
          name="name"
          placeholder="João Silva"
          required
          className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">E-mail Administrativo</label>
        <input 
          type="email" 
          name="email"
          placeholder="admin@exemplo.com"
          required
          className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">Senha Mestra</label>
        <input 
          type="password" 
          name="password"
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
        <p className="text-xs text-slate-500 dark:text-neutral-500 ml-1 transition-colors">Mínimo de 8 caracteres.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">Confirmar Senha</label>
        <input 
          type="password" 
          name="confirmPassword"
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 font-medium py-3 rounded-lg mt-6 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Configurando...' : 'Concluir Instalação'}
      </button>
    </form>
  )
}
