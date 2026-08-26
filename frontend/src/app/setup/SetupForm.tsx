'use client'

import { useState } from 'react'
import { setupAdmin } from '@/core/api'

export function SetupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

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
        <label className="text-sm font-medium text-neutral-300 ml-1">Nome do Projeto</label>
        <input 
          type="text" 
          name="projectName"
          placeholder="Meu Site Incrível"
          required
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
      </div>

      <hr className="border-neutral-800 my-4" />

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-300 ml-1">Nome do Administrador</label>
        <input 
          type="text" 
          name="name"
          placeholder="João Silva"
          required
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-300 ml-1">E-mail Administrativo</label>
        <input 
          type="email" 
          name="email"
          placeholder="admin@exemplo.com"
          required
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-300 ml-1">Senha Mestra</label>
        <input 
          type="password" 
          name="password"
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
        <p className="text-xs text-neutral-500 ml-1">Mínimo de 8 caracteres.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-300 ml-1">Confirmar Senha</label>
        <input 
          type="password" 
          name="confirmPassword"
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-white text-black hover:bg-neutral-200 font-medium py-3 rounded-lg mt-6 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Configurando...' : 'Concluir Instalação'}
      </button>
    </form>
  )
}
