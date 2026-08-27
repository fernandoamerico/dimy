import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';

export default function Home() {
  return (
    <DashboardLayout>
      <PageContainer>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bem-vindo ao Dimy!</h2>
          <p className="text-slate-500 dark:text-neutral-400 mt-2">
            Este é o painel inicial do seu novo projeto, preservando toda a estrutura visual da Owwwly.
          </p>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
