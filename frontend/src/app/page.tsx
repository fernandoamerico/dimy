import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bem-vindo ao Dimy!</h2>
          <p className="text-slate-500 dark:text-neutral-400 mt-2">
            Este é o painel inicial do seu novo projeto, preservando toda a estrutura visual da Owwwly.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
