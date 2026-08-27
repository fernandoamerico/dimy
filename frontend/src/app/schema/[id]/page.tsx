'use client';

import { useEffect, useState, use } from 'react';
import { getCollectionById } from '@/core/schema/actions';
import { useRouter } from 'next/navigation';
import { EditCollectionForm } from './EditCollectionForm';

export default function EditSchemaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { id } = use(params);

  useEffect(() => {
    async function load() {
      const col = await getCollectionById(id);
      if (!col) return router.push('/schema');
      
      setCollection(col);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) return null;

  return <EditCollectionForm collection={collection} />;
}
