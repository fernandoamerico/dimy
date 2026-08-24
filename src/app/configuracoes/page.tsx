import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Configurações Gerais
          </h1>
          <p className="text-gray-500 mt-1">Ajuste as preferências globais do seu CMS e chaves de API.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Preferências do Sistema</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nome da Plataforma</label>
                <input 
                  type="text" 
                  defaultValue="Adimy"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Idioma Principal</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-gray-100">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm">
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
