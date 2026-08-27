import { LoginForm } from './LoginForm'
import { Lock } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-8 shadow-2xl relative overflow-hidden transition-colors">
        
        {/* Glow Effect - Dark Mode Only */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

        <div className="relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-neutral-700/50 mb-4 shadow-inner transition-colors">
              <Lock className="w-8 h-8 text-slate-700 dark:text-neutral-300 transition-colors" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight transition-colors">Login no Dimy</h1>
            <p className="text-slate-500 dark:text-neutral-400 text-sm mt-2 text-center transition-colors">
              Bem-vindo de volta! Insira suas credenciais.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
