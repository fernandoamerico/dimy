import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users } from 'lucide-react';

export default function EquipePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Gestão de Equipe
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os membros da equipe e atribua permissões de acesso ao CMS.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Membros da Equipe</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Convidar Membro
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                  AD
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Administrador</h3>
                  <p className="text-gray-500 text-xs">admin@dimy.com</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                Dono
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
