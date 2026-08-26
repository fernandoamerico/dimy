import { User } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProfileForm } from './ProfileForm'
import { getSession } from '@/core/auth/session'
import { prisma as db } from '@/core/db'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
        
        {/* Header da Página */}
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-emerald-500/10 rounded-2xl border border-blue-200 dark:border-emerald-500/20 text-blue-600 dark:text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-1">
              Atualize suas informações pessoais e credenciais de acesso.
            </p>
          </div>
        </div>

        {/* Formulário de Perfil */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden">
          {/* Glow de fundo */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none hidden dark:block" />
          
          <div className="relative z-10">
            <ProfileForm initialData={user} />
          </div>
        </section>

      </div>
    </DashboardLayout>
  )
}
