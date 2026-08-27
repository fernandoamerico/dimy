'use client'

import { useState } from 'react'
import { login } from '@/core/api'
import { AlertCircle } from 'lucide-react'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    const result = await login(data)
    
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
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">E-mail</label>
        <input 
          type="email" 
          name="email"
          placeholder="admin@exemplo.com"
          required
          className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1 transition-colors">Senha</label>
        <input 
          type="password" 
          name="password"
          placeholder="••••••••"
          required
          className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 font-medium py-3 rounded-lg mt-6 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Entrando...' : 'Entrar no Painel'}
      </button>
    </form>
  )
}
