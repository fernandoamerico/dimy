'use client';

import { User } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProfileForm } from './ProfileForm'
import { ThemeToggle } from '@/app/configuracoes/ThemeToggle'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string, email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          window.location.href = '/login'
          throw new Error('Não autorizado')
        }
        return res.json()
      })
      .then(data => {
        setUser({ name: data.name, email: data.email })
        setIsLoading(false)
      })
      .catch(() => {
        window.location.href = '/login'
      })
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
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
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden mb-8">
          {/* Glow de fundo */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none hidden dark:block" />
          
          <div className="relative z-10">
            {user && <ProfileForm initialData={user} />}
          </div>
        </section>

        {/* Preferências de Aparência */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aparência</h2>
            <p className="text-gray-500 dark:text-neutral-400 mb-6">
              Personalize a aparência do sistema de acordo com sua preferência.
            </p>
            <ThemeToggle />
          </div>
        </section>

      </div>
    </DashboardLayout>
  )
}
