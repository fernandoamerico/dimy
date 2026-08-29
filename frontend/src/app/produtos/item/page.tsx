'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionBySlug, getDocument } from '@/core/content/actions';
import { ProductEditor } from '@/components/produtos/ProductEditor';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';

function ProductEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') as string;
  const id = searchParams.get('id') as string;
  const [collection, setCollection] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isNew = id === 'novo';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const col = await getCollectionBySlug(slug);
      
      if (!col) {
        router.push('/produtos');
        return;
      }

      let isProduct = false;
      try {
        const meta = col.metadata ? JSON.parse(col.metadata) : {};
        isProduct = meta.is_product === true;
      } catch (e) {}

      if (!isProduct) {
        router.push('/produtos');
        return;
      }

      setCollection(col);

      if (!isNew) {
        const doc = await getDocument(id);
        if (!doc || doc.collectionId !== col.id) {
          router.push(`/produtos/lista?slug=${slug}`);
          return;
        }
        setDocument(doc);
      }
      
      setLoading(false);
    }

    if (slug && id) {
      loadData();
    } else {
      router.push('/produtos');
    }
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

  return (
    <DashboardLayout>
      <div className="py-4">
        <ProductEditor 
          collection={collection} 
          document={document} 
          isNew={isNew} 
        />
      </div>
    </DashboardLayout>
  );
}

export default function ProductEditorPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Carregando...</div></DashboardLayout>}>
      <ProductEditorContent />
    </Suspense>
  )
}
