import { LoginForm } from './LoginForm'
import { Lock } from 'lucide-react'

export default function LoginPage() {
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
            <h1 className="text-2xl font-semibold text-white tracking-tight">Login no Dimy</h1>
            <p className="text-neutral-400 text-sm mt-2 text-center">
              Bem-vindo de volta! Insira suas credenciais.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
