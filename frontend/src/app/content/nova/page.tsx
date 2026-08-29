'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionBySlug } from '@/core/content/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContentForm } from '@/components/builder/ContentForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function NovaContentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const col = await getCollectionBySlug(slug);
      if (!col) return router.push('/content');
      
      setCollection(col);
      setLoading(false);
    }
    load();
  }, [slug, router]);

  if (loading) return null;

  return <ContentForm collection={collection} />;
}

export default function NovaContentPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Carregando...</div>}>
        <NovaContentContent />
      </Suspense>
    </DashboardLayout>
  )
}
