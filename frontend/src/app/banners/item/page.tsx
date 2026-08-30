'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionBySlug, getDocument } from '@/core/content/actions';
import { ContentForm } from '@/components/builder/ContentForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';

function BannerItemEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const id = searchParams.get('id') as string;
  const [collection, setCollection] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isNew = id === 'nova';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const col = await getCollectionBySlug(slug);
      
      if (!col) {
        router.push('/banners');
        return;
      }

      let isBanner = false;
      try {
        const meta = col.metadata ? JSON.parse(col.metadata) : {};
        isBanner = meta.is_banner === true;
      } catch (e) {}

      if (!isBanner) {
        router.push('/banners');
        return;
      }

      setCollection(col);

      if (!isNew) {
        const doc = await getDocument(id);
        if (!doc || doc.collectionId !== col.id) {
          router.push(`/banners/list?slug=${slug}`);
          return;
        }
        setDocument(doc);
      }
      
      setLoading(false);
    }

    loadData();
  }, [slug, id, isNew, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-emerald-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Set default active = true for new banners
  const initialData = isNew ? { active: true } : (document?.data || {});

  return (
    <DashboardLayout>
      <ContentForm 
        collection={collection} 
        initialData={initialData}
        documentId={isNew ? null : document.id}
        backUrl={`/banners/list?slug=${collection.slug}`}
      />
    </DashboardLayout>
  );
}

export default function BannerItemEditorPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Carregando...</div></DashboardLayout>}>
      <BannerItemEditorContent />
    </Suspense>
  )
}
