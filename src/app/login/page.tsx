import { prisma as db } from '@/core/db'
import { redirect } from 'next/navigation'
import { login } from '@/core/auth/actions'
import { Box, Lock } from 'lucide-react'

export default async function LoginPage() {
  const userCount = await db.user.count()
  
  if (userCount === 0) {
    redirect('/setup')
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center border border-neutral-700/50 mb-4 shadow-inner">
              <Lock className="w-8 h-8 text-neutral-300" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Login no Adimy</h1>
            <p className="text-neutral-400 text-sm mt-2 text-center">
              Bem-vindo de volta! Insira suas credenciais.
            </p>
          </div>

          <form action={login} className="space-y-4">
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
              className="w-full bg-white text-black hover:bg-neutral-200 font-medium py-3 rounded-lg mt-6 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
