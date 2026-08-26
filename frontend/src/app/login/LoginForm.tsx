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
        <label className="text-sm font-medium text-neutral-300 ml-1">E-mail</label>
        <input 
          type="email" 
          name="email"
          placeholder="admin@exemplo.com"
          required
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-300 ml-1">Senha</label>
        <input 
          type="password" 
          name="password"
          placeholder="••••••••"
          required
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-white text-black hover:bg-neutral-200 font-medium py-3 rounded-lg mt-6 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Entrando...' : 'Entrar no Painel'}
      </button>
    </form>
  )
}
