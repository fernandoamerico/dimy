'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCollections } from '@/core/schema/actions';
import { UniversalBuilder } from '@/components/builder/UniversalBuilder';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProductCategoryBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const collections = await getCollections();
      const found = collections.find((c: any) => c.id === params.id);
      if (!found) {
        router.push('/produtos/categorias');
        return;
      }
      setCollection(found);
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-4">
        <UniversalBuilder
          collection={collection}
          backUrl="/produtos/categorias"
          appType="product"
        />
      </div>
    </DashboardLayout>
  );
}
