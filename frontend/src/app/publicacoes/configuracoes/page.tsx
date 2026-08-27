'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionBySlug } from '@/core/content/actions';
import { CategoryBuilder } from '@/components/publications/CategoryBuilder';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';

function CategoryConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const col = await getCollectionBySlug(slug);

      if (!col) {
        router.push('/publicacoes');
        return;
      }

      // Parse metadata to ensure it's a publication
      let isPublication = false;
      try {
        const meta = col.metadata ? JSON.parse(col.metadata) : {};
        isPublication = meta.is_publication === true;
      } catch (e) {}

      if (!isPublication) {
        router.push('/publicacoes'); // Protect route: Only publications should use CategoryBuilder
        return;
      }

      setCollection(col);
      setLoading(false);
    }

    loadData();
  }, [slug, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-emerald-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CategoryBuilder collection={collection} />
    </DashboardLayout>
  );
}

export default function CategoryConfigPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Carregando...</div></DashboardLayout>}>
      <CategoryConfigContent />
    </Suspense>
  )
}
