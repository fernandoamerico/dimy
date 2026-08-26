import { getCollectionById } from '@/core/schema/actions';
import { notFound } from 'next/navigation';
import { EditCollectionForm } from './EditCollectionForm';

export default async function EditSchemaPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const collection = await getCollectionById(id);
  
  if (!collection) {
    notFound();
  }

  return <EditCollectionForm collection={collection} />;
}

export function generateStaticParams() { return [{ slug: 'empty', id: 'empty' }]; }

