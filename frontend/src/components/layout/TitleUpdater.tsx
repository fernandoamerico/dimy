'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function TitleUpdater() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    let title = 'Dimy';
    
    if (pathname === '/') title = 'Dashboard | Dimy';
    else if (pathname?.startsWith('/produtos')) title = 'Produtos | Dimy';
    else if (pathname?.startsWith('/paginas')) title = 'Páginas | Dimy';
    else if (pathname?.startsWith('/publicacoes')) title = 'Publicações | Dimy';
    else if (pathname?.startsWith('/configuracoes')) title = 'Configurações | Dimy';
    else if (pathname?.startsWith('/aplicativos')) title = 'Aplicativos | Dimy';
    else if (pathname?.startsWith('/midias')) title = 'Mídias | Dimy';
    else if (pathname?.startsWith('/equipe')) title = 'Equipe | Dimy';
    else if (pathname?.startsWith('/perfil')) title = 'Meu Perfil | Dimy';
    else if (pathname?.startsWith('/loja')) title = 'Loja de Apps | Dimy';
    
    const slug = searchParams?.get('slug');
    if (slug) {
      let cleanSlug = slug;
      const prefixesToRemove = ['post-category-', 'product-category-', 'page-category-'];
      for (const prefix of prefixesToRemove) {
        if (cleanSlug.startsWith(prefix)) {
          cleanSlug = cleanSlug.replace(prefix, '');
          break;
        }
      }
      const slugTitle = cleanSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      title = `${slugTitle} | Dimy`;
    }

    document.title = title;
  }, [pathname, searchParams]);

  return null;
}
