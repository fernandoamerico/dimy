import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Hash } from 'lucide-react';

export default function Modulo2Page() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Hash className="w-6 h-6 text-blue-600" />
            Módulo 2: Parâmetros e Variáveis
          </h1>
          <p className="text-gray-500 mt-1">Configure variáveis de ambiente, tags dinâmicas e constantes de sistema.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-8 shadow-sm space-y-4">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Módulo 2 está pronto para expansão</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Espaço reservado para chaves, enums e configurações de parâmetros estáticos do CMS Adimy.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
