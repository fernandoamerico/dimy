'use client'

import { useState } from 'react'
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'

export function ProfileForm({ initialData }: { initialData: { name: string, email: string } }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(null)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const oldPassword = formData.get('oldPassword') as string
    const newPassword = formData.get('newPassword') as string

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, oldPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao atualizar perfil')
      } else {
        setSuccess('Perfil atualizado com sucesso!')
        const form = e.target as HTMLFormElement
        form.oldPassword.value = ''
        form.newPassword.value = ''
      }
    } catch (err) {
      setError('Erro de conexão ao tentar atualizar o perfil.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Nome</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
              <User className="h-5 w-5" />
            </div>
            <input
              name="name"
              type="text"
              required
              defaultValue={initialData.name}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:outline-none transition-all"
              placeholder="Seu nome"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              name="email"
              type="email"
              required
              defaultValue={initialData.email}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100 dark:border-neutral-800 my-8" />

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-blue-500 dark:text-emerald-400" />
          Segurança da Conta
        </h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
          Para alterar sua senha, você deve preencher sua senha atual por motivos de segurança. 
          Caso contrário, deixe os campos em branco.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Senha Atual</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                name="oldPassword"
                type="password"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="Obrigatório apenas para mudar a senha"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Nova Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                name="newPassword"
                type="password"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="Sua nova senha segura"
                minLength={8}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </button>
      </div>
    </form>
  )
}
