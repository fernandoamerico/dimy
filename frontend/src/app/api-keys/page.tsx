'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { apiKeysService } from '@/core/api'

interface ApiKey {
  id: string
  name: string
  key?: string
  role: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      setIsLoading(true)
      const data = await apiKeysService.list()
      setKeys(data || [])
    } catch (err) {
      console.error(err)
      alert("Erro ao carregar as chaves de API.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      setIsCreating(true)
      const newKey = await apiKeysService.create(newName)
      setNewlyCreatedKey(newKey.key)
      setNewName('')
      await fetchKeys() // reload the list
    } catch (err) {
      console.error(err)
      alert("Erro ao criar chave de API.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja revogar esta chave? Qualquer integração usando ela irá parar imediatamente.")) return

    try {
      await apiKeysService.delete(id)
      await fetchKeys()
    } catch (err) {
      console.error(err)
      alert("Erro ao remover chave.")
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <PageContainer>
        
        {/* Header da Página */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chaves de API</h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-1">
              Gere tokens de acesso seguros para que seus aplicativos consumam o conteúdo do Dimy.
            </p>
          </div>
        </div>

        {/* Formulário de Nova Chave */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden mb-8">
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gerar Nova Chave</h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1 mb-6">
              Dê um nome para identificar o aplicativo ou site que usará esta chave.
            </p>

            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">Nome da Integração</label>
                <input
                  type="text"
                  placeholder="ex: Meu App Mobile"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {isCreating ? 'Gerando...' : 'Gerar Chave'}
              </button>
            </form>

            {newlyCreatedKey && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">
                  Chave gerada com sucesso! Guarde-a agora.
                </h3>
                <p className="text-sm text-green-700 dark:text-green-500 mb-4">
                  Por questões de segurança, você não poderá ver esta chave novamente.
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-white dark:bg-neutral-900 border border-green-200 dark:border-green-500/30 text-gray-900 dark:text-white px-4 py-3 rounded-lg text-sm font-mono break-all select-all">
                    {newlyCreatedKey}
                  </code>
                  <button
                    onClick={() => handleCopy(newlyCreatedKey)}
                    className="p-3 bg-white dark:bg-neutral-900 border border-green-200 dark:border-green-500/30 hover:bg-green-100 dark:hover:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                    title="Copiar Chave"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Listagem de Chaves */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Chaves Ativas</h2>
            
            {isLoading ? (
              <div className="text-gray-500 dark:text-neutral-400 py-8 text-center">Carregando chaves...</div>
            ) : keys.length === 0 ? (
              <div className="text-gray-500 dark:text-neutral-400 py-8 text-center bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-gray-200 dark:border-neutral-700">
                Nenhuma chave gerada ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-neutral-800">
                      <th className="pb-3 text-sm font-medium text-gray-500 dark:text-neutral-400">Nome da Integração</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 dark:text-neutral-400">Permissão</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 dark:text-neutral-400">Data de Criação</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 dark:text-neutral-400 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k) => (
                      <tr key={k.id} className="border-b border-gray-50 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {k.name}
                        </td>
                        <td className="py-4 text-sm text-gray-500 dark:text-neutral-400 capitalize">
                          {k.role === 'read' ? 'Leitura (Read-Only)' : k.role}
                        </td>
                        <td className="py-4 text-sm text-gray-500 dark:text-neutral-400">
                          {new Date(k.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 text-sm text-right">
                          <button
                            onClick={() => handleDelete(k.id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Revogar Chave"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </PageContainer>
    </DashboardLayout>
  )
}
