import { getCollectionBySlug } from '@/core/content/actions';
import { notFound } from 'next/navigation';
import { ContentForm } from '@/components/builder/ContentForm';

export default async function NovaContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const collection = await getCollectionBySlug(slug);
  
  if (!collection) {
    notFound();
  }

  return <ContentForm collection={collection} />;
}
