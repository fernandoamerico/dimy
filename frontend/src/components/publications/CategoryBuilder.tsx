import { UniversalBuilder } from '@/components/builder/UniversalBuilder';

export function CategoryBuilder({
  collection,
}: {
  collection: any;
}) {
  return (
    <UniversalBuilder 
      collection={collection} 
      backUrl={`/publicacoes/list?slug=${collection.slug}`}
      appType="publication" 
    />
  );
}
