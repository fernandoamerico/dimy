import { getCollectionBySlug, getDocument } from '@/core/content/actions';
import { notFound } from 'next/navigation';
import { ContentForm } from '@/components/builder/ContentForm';

export default async function EditContentPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const p = await params;
  
  const collection = await getCollectionBySlug(p.slug);
  if (!collection) {
    notFound();
  }

  const document = await getDocument(p.id);
  if (!document) {
    notFound();
  }

  return <ContentForm collection={collection} initialData={document.data} documentId={document.id} />;
}

export function generateStaticParams() { return [{ slug: 'empty', id: 'empty' }]; }

