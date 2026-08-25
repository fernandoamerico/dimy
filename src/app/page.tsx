import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bem-vindo ao Adimy!</h2>
          <p className="text-slate-500 dark:text-neutral-400 mt-2">
            Este é o painel inicial do seu novo projeto, preservando toda a estrutura visual da Owwwly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 dark:border-neutral-800 flex flex-col transition-shadow">
            <div className="w-12 h-12 bg-blue-50 dark:bg-neutral-800 text-blue-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Módulo 1</h3>
            <p className="text-slate-500 dark:text-neutral-400 text-sm">Espaço reservado para o conteúdo principal.</p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 dark:border-neutral-800 flex flex-col transition-shadow">
            <div className="w-12 h-12 bg-blue-50 dark:bg-neutral-800 text-blue-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Módulo 2</h3>
            <p className="text-slate-500 dark:text-neutral-400 text-sm">Integrações e opções adicionais.</p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 dark:border-neutral-800 flex flex-col transition-shadow">
            <div className="w-12 h-12 bg-blue-50 dark:bg-neutral-800 text-blue-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Módulo 3</h3>
            <p className="text-slate-500 dark:text-neutral-400 text-sm">Estatísticas gerais e métricas.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
