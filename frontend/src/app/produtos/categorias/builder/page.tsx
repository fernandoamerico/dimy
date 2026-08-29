'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCollections } from '@/core/schema/actions';
import { UniversalBuilder } from '@/components/builder/UniversalBuilder';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function ProductCategoryBuilderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const collections = await getCollections();
      const found = collections.find((c: any) => c.id === id);
      if (!found) {
        router.push('/produtos/categorias');
        return;
      }
      setCollection(found);
      setLoading(false);
    }
    load();
  }, [id, router]);

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

export default function ProductCategoryBuilderPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div></DashboardLayout>}>
      <ProductCategoryBuilderContent />
    </Suspense>
  );
}
