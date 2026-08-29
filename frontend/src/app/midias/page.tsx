'use client';

import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Image as ImageIcon } from 'lucide-react';

export default function MidiasPage() {
  return (
    <DashboardLayout>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
              Biblioteca de Mídia
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gerencie todas as imagens e arquivos do seu site centralizados em um só lugar.
            </p>
          </div>
        </div>
        
        <MediaLibraryModal isModal={false} isSelectionMode={false} />
      </PageContainer>
    </DashboardLayout>
  );
}
