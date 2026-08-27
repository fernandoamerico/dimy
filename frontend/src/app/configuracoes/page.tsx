import { Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { SidebarOrderManager } from './SidebarOrderManager'
import { PageContainer } from '@/components/layout/PageContainer'
import { UpdateNotifier } from './UpdateNotifier'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <PageContainer>
        
        {/* Header da Página */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-emerald-500/10 rounded-2xl border border-blue-200 dark:border-emerald-500/20 text-blue-600 dark:text-emerald-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-1">
              Gerencie as preferências visuais e gerais do sistema.
            </p>
          </div>
        </div>

        {/* Seção de Atualizações */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Atualizações do Sistema</h2>
            <hr className="border-gray-100 dark:border-neutral-800 my-6" />
            <UpdateNotifier />
          </div>
        </section>

        {/* Seção de Aparência */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden">
          {/* Glow de fundo se for tema escuro (opcional, só pra dar charme) */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none hidden dark:block" />

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Aparência do Painel</h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1 mb-6">
              Escolha como você prefere visualizar o Dimy. A sua escolha é salva no navegador.
            </p>

            <hr className="border-gray-100 dark:border-neutral-800" />

            <ThemeToggle />
          </div>
        </section>

        {/* Seção de Organização do Menu */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Organização do Menu</h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1 mb-6">
              Reordene os itens do menu principal e as coleções dinâmicas de acordo com a sua preferência.
            </p>

            <hr className="border-gray-100 dark:border-neutral-800 mb-6" />

            <SidebarOrderManager />
          </div>
        </section>

        {/* Outras Seções Futuras */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 lg:p-8 dark:border dark:border-neutral-800 opacity-50 select-none">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            Mais configurações 
            <span className="text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded-md text-gray-500 dark:text-neutral-400 font-medium">
              Em breve
            </span>
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">
            Opções de conta, banco de dados e integrações serão adicionadas em futuras atualizações.
          </p>
        </section>

      </PageContainer>
    </DashboardLayout>
  )
}
