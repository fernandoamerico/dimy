'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionBySlug, getDocument } from '@/core/content/actions';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { ContentForm } from '@/components/builder/ContentForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function EditContentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const id = searchParams.get('id') as string;
  
  const [collection, setCollection] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const col = await getCollectionBySlug(slug);
      if (!col) return router.push('/content');
      
      const doc = await getDocument(id);
      if (!doc) return router.push(`/content/list?slug=${slug}`);

      setCollection(col);
      setDocument(doc);
      setLoading(false);
    }
    load();
  }, [slug, id, router]);

  if (loading) return null;

  return <ContentForm collection={collection} initialData={document.data} documentId={document.id} />;
}

export default function EditContentPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Carregando...</div>}>
        <EditContentContent />
      </Suspense>
    </DashboardLayout>
  )
}
