'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { fetchAPI } from '@/core/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAuthAndSetup() {
      try {
        // 1. Check system config (isSetup)
        const configRes = await fetchAPI('/config')
        
        if (!configRes.isSetup) {
          // Se não estiver configurado e não estiver na rota de setup, redireciona
          if (pathname !== '/setup') {
            router.push('/setup')
          } else {
            setIsChecking(false)
          }
          return
        }

        // 2. Se estiver configurado, checa se o usuário está logado
        try {
          await fetchAPI('/auth/me')
          // Se não deu erro, o usuário está logado.
          // Se ele tentar acessar /login ou /setup, joga pro dashboard
          if (pathname === '/login' || pathname === '/setup') {
            router.push('/')
          } else {
            setIsChecking(false)
          }
        } catch (authError) {
          // Erro 401: Usuário não está logado
          if (pathname !== '/login') {
            router.push('/login')
          } else {
            setIsChecking(false)
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        // Em caso de falha catastrófica de rede, libera a tela para pelo menos ver o erro,
        // ou redireciona para login preventivamente.
        setIsChecking(false)
      }
    }

    checkAuthAndSetup()
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f8fafc] dark:bg-neutral-950 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-neutral-400 text-sm animate-pulse">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
