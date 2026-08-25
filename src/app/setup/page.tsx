import { prisma as db } from '@/core/db'
import { redirect } from 'next/navigation'
import { setupAdmin } from '@/core/auth/actions'
import { Rocket, ShieldCheck } from 'lucide-react'
import { SetupForm } from './SetupForm'

export default async function SetupPage() {
  const userCount = await db.user.count()
  
  if (userCount > 0) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8">
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Sidebar Info */}
        <div className="md:w-1/3 flex flex-col justify-between relative z-10">
          <div>
            <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-700/50 mb-6 shadow-inner">
              <Rocket className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight mb-2">
              Bem-vindo ao Adimy
            </h1>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              O seu novo CMS de alta performance está quase pronto. Vamos configurar o administrador principal.
            </p>
          </div>
          
          <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 text-sm text-neutral-300">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Instalação Segura</span>
            </div>
          </div>
        </div>

        {/* Setup Form */}
        <div className="md:w-2/3 relative z-10">
          <SetupForm />
        </div>
      </div>
    </div>
  )
}
