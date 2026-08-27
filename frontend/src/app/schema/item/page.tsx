'use client';

import { useEffect, useState, Suspense } from 'react';
import { getCollectionById } from '@/core/schema/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditCollectionForm } from './EditCollectionForm';

function EditSchemaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const col = await getCollectionById(id as string);
      if (!col) return router.push('/schema');
      
      setCollection(col);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) return null;

  return <EditCollectionForm collection={collection} />;
}

export default function EditSchemaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditSchemaContent />
    </Suspense>
  )
}
