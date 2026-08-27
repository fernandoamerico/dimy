'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionBySlug, getDocuments, createDocument } from '@/core/content/actions';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { PageBuilder } from '@/components/pages/PageBuilder';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function PageBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const [collection, setCollection] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const col = await getCollectionBySlug(slug);
        if (!col) {
          router.push('/404');
          return;
        }

        let isPage = false;
        try {
          const meta = col.metadata ? JSON.parse(col.metadata) : {};
          isPage = meta.is_page === true;
        } catch (e) {}

        if (!isPage) {
          router.push('/404');
          return;
        }

        const docs = await getDocuments(col.id);
        let doc = docs.length > 0 ? docs[0] : null;

        if (!doc) {
          const res = await createDocument(col.id, col.slug, {});
          if (res.success && res.document) {
            doc = res.document;
          }
        }

        setCollection(col);
        setDocument(doc || {}); // fallback if creation failed
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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

  if (!collection) return null;

  return (
    <DashboardLayout>
      <PageBuilder 
        collection={collection} 
        document={document} 
      />
    </DashboardLayout>
  );
}

export default function PageBuilderPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Carregando...</div></DashboardLayout>}>
      <PageBuilderContent />
    </Suspense>
  )
}
