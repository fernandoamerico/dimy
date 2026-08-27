'use client';

import { useEffect, useState, use } from 'react';
import { getCollectionBySlug, getDocument } from '@/core/content/actions';
import { notFound, useRouter } from 'next/navigation';
import { ContentForm } from '@/components/builder/ContentForm';

export default function EditContentPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { slug, id } = use(params);

  useEffect(() => {
    async function load() {
      const col = await getCollectionBySlug(slug);
      if (!col) return router.push('/content');
      
      const doc = await getDocument(id);
      if (!doc) return router.push(`/content/${slug}`);

      setCollection(col);
      setDocument(doc);
      setLoading(false);
    }
    load();
  }, [slug, id, router]);

  if (loading) return null;

  return <ContentForm collection={collection} initialData={document.data} documentId={document.id} />;
}
