'use client';

import { useEffect, useState, use } from 'react';
import { getCollectionBySlug } from '@/core/content/actions';
import { useRouter } from 'next/navigation';
import { ContentForm } from '@/components/builder/ContentForm';

export default function NovaContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { slug } = use(params);

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
