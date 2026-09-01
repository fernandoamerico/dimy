'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { RefreshCw, Database, HardDrive, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchAPI } from '@/core/api';

interface SystemStatus {
  update: {
    hasUpdate: boolean;
    currentVersion: string;
    latestVersion: string;
    releaseUrl: string;
  };
  database: {
    type: string;
    connected: boolean;
    label: string;
  };
  storage: {
    type: string;
    configured: boolean;
    label: string;
  };
}

export default function Home() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/system/status')
      .then((data) => {
        setStatus(data as SystemStatus);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching system status:', err);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <PageContainer>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Painel Inicial</h2>
          <p className="text-slate-500 dark:text-neutral-400 mb-8">
            Bem-vindo ao Dimy! Acompanhe o status do seu sistema.
          </p>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : status ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Update Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Atualizações</h3>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50 dark:border-neutral-800">
                  {status.update.hasUpdate ? (
                    <div className="flex flex-col gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4" /> Nova versão: {status.update.latestVersion}
                      </span>
                      <a href={status.update.releaseUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                        Ver notas da versão
                      </a>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Sistema atualizado (v{status.update.currentVersion})
                    </span>
                  )}
                </div>
              </div>

              {/* Database Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Banco de Dados</h3>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50 dark:border-neutral-800">
                  <span className={`flex items-center gap-2 text-sm font-medium ${status.database.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {status.database.connected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {status.database.label} — {status.database.connected ? 'Conectado' : 'Erro na Conexão'}
                  </span>
                </div>
              </div>

              {/* Storage Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Armazenamento</h3>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50 dark:border-neutral-800">
                  {status.storage.configured ? (
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> {status.storage.label} (Configurado)
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" /> Local (Não configurado para nuvem)
                    </span>
                  )}
                </div>
              </div>

            </div>
          ) : (
             <div className="text-center p-12 text-gray-500">Erro ao carregar informações do sistema.</div>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
