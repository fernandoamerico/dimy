'use client';

import { useEffect, useState, use } from 'react';
import { getCollectionBySlug } from '@/core/content/actions';
import { CategoryBuilder } from '@/components/publications/CategoryBuilder';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function CategoryConfigPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { slug } = use(params);

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
