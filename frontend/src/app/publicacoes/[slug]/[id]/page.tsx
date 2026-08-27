'use client';

import { useEffect, useState, use } from 'react';
import { getCollectionBySlug, getDocument } from '@/core/content/actions';
import { PostEditor } from '@/components/publications/PostEditor';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function PublicationEditorPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { slug, id } = use(params);
  const isNew = id === 'nova';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const col = await getCollectionBySlug(slug);
      
      if (!col) {
        router.push('/publicacoes');
        return;
      }

      let isPublication = false;
      try {
        const meta = col.metadata ? JSON.parse(col.metadata) : {};
        isPublication = meta.is_publication === true;
      } catch (e) {}

      if (!isPublication) {
        router.push('/publicacoes');
        return;
      }

      setCollection(col);

      if (!isNew) {
        const doc = await getDocument(id);
        if (!doc || doc.collectionId !== col.id) {
          router.push(`/publicacoes/${slug}`);
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

  return (
    <DashboardLayout>
      <PostEditor 
        collection={collection} 
        document={document} 
        isNew={isNew} 
      />
    </DashboardLayout>
  );
}
