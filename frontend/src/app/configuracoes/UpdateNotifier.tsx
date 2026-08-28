'use client'

import { useEffect, useState } from 'react'
import { Rocket, Download, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface UpdateInfo {
  latest_version: string
  changelog: string
  release_url: string
  published_at: string
}

export function UpdateNotifier() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string>("v0.1.0")

  useEffect(() => {
    Promise.all([
      fetch('/api/system/update').then(res => {
        if (!res.ok) throw new Error('Failed to fetch update info')
        return res.json()
      }),
      fetch('/api/system/version').then(res => {
        if (!res.ok) throw new Error('Failed to fetch version')
        return res.json()
      })
    ])
      .then(([updateData, versionData]) => {
        setUpdateInfo(updateData)
        if (versionData && versionData.version) {
          setCurrentVersion(versionData.version)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Verificando atualizações...</div>
  }

  if (error || !updateInfo) {
    return <div className="text-red-500 text-sm">Não foi possível verificar atualizações no momento.</div>
  }

  // Very simple version check (assumes standard semver tags like v1.0.0)
  const hasUpdate = updateInfo.latest_version && updateInfo.latest_version !== currentVersion

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            Versão Atual: <span className="text-blue-600 dark:text-emerald-400 font-bold">{currentVersion}</span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Mantenha seu sistema atualizado para receber os últimos recursos e correções de segurança.
          </p>
        </div>
        
        {hasUpdate ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-emerald-500/20 text-blue-700 dark:text-emerald-400 text-sm font-semibold">
            <Rocket className="w-4 h-4" />
            Nova versão disponível: {updateInfo.latest_version}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-sm font-medium">
            Você está usando a versão mais recente
          </span>
        )}
      </div>

      {hasUpdate && (
        <div className="bg-blue-50 dark:bg-neutral-950 border border-blue-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-xl mt-1">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Atualização {updateInfo.latest_version} disponível!
              </h4>
              
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-neutral-300 mb-6 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 max-h-60 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{updateInfo.changelog}</ReactMarkdown>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-blue-100 dark:border-neutral-800">
                <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 dark:text-emerald-500" />
                  Como atualizar o sistema:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-neutral-950 rounded-lg">
                    <strong className="block text-gray-900 dark:text-white mb-1">Se você usa Docker (Recomendado):</strong>
                    <code className="block bg-gray-200 dark:bg-neutral-800 p-2 rounded text-xs text-blue-600 dark:text-emerald-400">
                      docker compose pull && docker compose up -d
                    </code>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-neutral-950 rounded-lg">
                    <strong className="block text-gray-900 dark:text-white mb-1">Se você usa Bare Metal (VPS Linux):</strong>
                    <p className="text-gray-600 dark:text-neutral-400 text-xs">
                      Baixe o executável em <a href={updateInfo.release_url} target="_blank" rel="noreferrer" className="text-blue-500 underline">Releases</a>, substitua o binário atual e reinicie o serviço (ex: via Systemd).
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
