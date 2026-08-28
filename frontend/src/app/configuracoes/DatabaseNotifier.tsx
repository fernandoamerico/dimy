'use client'

import { useEffect, useState } from 'react'
import { Database, AlertTriangle } from 'lucide-react'

export function DatabaseNotifier() {
  const [isSupabase, setIsSupabase] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setIsSupabase(data.isSupabase)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch config', err)
        setLoading(false)
      })
  }, [])

  if (loading || isSupabase) {
    // Se estiver carregando ou se JÁ ESTIVER conectado ao Supabase, não precisamos mostrar o aviso de limitação.
    return null
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-6 shadow-sm mt-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl mt-1">
          <Database className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            Banco de Dados Atual: SQLite (Modo Local/Dev)
          </h4>
          
          <p className="text-sm text-gray-600 dark:text-neutral-300 mb-4">
            Notamos que a variável <code className="bg-orange-100 dark:bg-orange-900/50 px-1.5 py-0.5 rounded text-orange-700 dark:text-orange-300">DATABASE_URL</code> não está configurada no ambiente. 
            O CMS está rodando atualmente com o banco de dados padrão SQLite.
          </p>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-orange-100 dark:border-neutral-800">
            <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Aviso sobre Produção
            </h5>
            <p className="text-xs text-gray-600 dark:text-neutral-400">
              Para ambientes de produção, o CMS possui suporte oficial out-of-the-box focado **exclusivamente no Supabase (PostgreSQL)**. 
              Caso deseje utilizar outros provedores ou bancos de dados relacionais, a adaptação da infraestrutura deverá ser feita de forma independente pela sua equipe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
