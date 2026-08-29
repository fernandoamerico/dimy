import type { ExtensionDef } from './types';

export const EXTENSION_REGISTRY: ExtensionDef[] = [
  // ---------------------------------------------------------
  // CORE EXTENSIONS — sempre instalados, não podem ser removidos
  // ---------------------------------------------------------
  {
    id: 'core_dashboard',
    name: 'Painel Inicial',
    description: 'Dashboard principal com a visão geral do sistema.',
    type: 'core',
    isEssential: true,
    navItems: [
      { label: 'Visão Geral', href: '/', iconName: 'LayoutDashboard', requiredPermissions: ['view:dashboard'] }
    ]
  },
  {
    id: 'core_settings',
    name: 'Configurações',
    description: 'Gerenciamento das configurações globais do CMS.',
    type: 'core',
    isEssential: true,
    navItems: [
      { label: 'Configurações', href: '/configuracoes', iconName: 'Settings', requiredPermissions: ['manage:settings'] }
    ]
  },
  {
    id: 'core_extensions',
    name: 'Aplicativos',
    description: 'Gerencie e instale novos módulos e funcionalidades no CMS.',
    type: 'core',
    isEssential: true,
    navItems: [
      { label: 'Aplicativos', href: '/aplicativos', iconName: 'Blocks', requiredPermissions: ['manage:extensions'] }
    ]
  },

  // ---------------------------------------------------------
  // MODULES — instalados via loja
  // ---------------------------------------------------------
  {
    id: 'core_publications',
    name: 'Publicações',
    description: 'Crie e gerencie categorias de conteúdo como Blog, Serviços e Portfólio.',
    type: 'module',
    isEssential: false,
    navItems: [
      { label: 'Publicações', href: '/publicacoes', iconName: 'Newspaper', requiredPermissions: ['manage:publications'] }
    ]
  },
  {
    id: 'core_pages',
    name: 'Páginas',
    description: 'Crie páginas únicas com estrutura dinâmica (Ex: Sobre Nós, Home).',
    type: 'module',
    isEssential: false,
    navItems: [
      { label: 'Páginas', href: '/paginas', iconName: 'FileText', requiredPermissions: ['manage:pages'] }
    ]
  },
  {
    id: 'schema_products',
    name: 'Produtos',
    description: 'Catálogo de produtos com categorias, SKUs, preços e estoque.',
    type: 'module',
    isEssential: false,
    navItems: [
      { label: 'Produtos', href: '/produtos', iconName: 'Package', requiredPermissions: [] }
    ]
  },
  {
    id: 'schema_sliders',
    name: 'Banners & Carrosséis',
    description: 'Crie e gerencie slides e banners para qualquer parte do site.',
    type: 'schema',
    isEssential: false,
    schema: {
      name: 'Banners',
      slug: 'banners',
      iconName: 'Images',
      fields: [
        { name: 'group', label: 'Grupo (Ex: home-hero)', type: 'text', required: true, order: 0 },
        { name: 'title', label: 'Título do Slide', type: 'text', required: true, order: 1 },
        { name: 'subtitle', label: 'Subtítulo', type: 'text', required: false, order: 2 },
        { name: 'imageUrl', label: 'URL da Imagem', type: 'image', required: true, order: 3 },
        { name: 'buttonText', label: 'Texto do Botão', type: 'text', required: false, order: 4 },
        { name: 'buttonUrl', label: 'Link do Botão', type: 'text', required: false, order: 5 },
        { name: 'order', label: 'Ordem (1, 2, 3...)', type: 'number', required: true, order: 6 },
        { name: 'active', label: 'Ativo', type: 'boolean', required: true, order: 7 },
      ]
    }
  },
  {
    id: 'cloudflare_r2',
    name: 'Cloudflare R2',
    description: 'Armazene todas as imagens e mídias do seu CMS na nuvem da Cloudflare.',
    type: 'module',
    isEssential: false,
    navItems: []
  },
  {
    id: 'supabase_storage',
    name: 'Supabase Storage',
    description: 'Armazene imagens e arquivos do Dimy nos buckets integrados do seu projeto Supabase.',
    type: 'module',
    isEssential: false,
    navItems: []
  },
  {
    id: 'business_info',
    name: 'Meu Negócio',
    description: 'Gerencie informações centrais do seu negócio.',
    type: 'module',
    isEssential: false,
    navItems: [
      { label: 'Meu Negócio', href: '/meu-negocio', iconName: 'Briefcase', requiredPermissions: ['manage:settings'] }
    ]
  },
  {
    id: 'supabase_config',
    name: 'Supabase',
    description: 'Conecte o Dimy ao Supabase para garantir a persistência dos seus dados na nuvem.',
    type: 'module',
    isEssential: false,
    navItems: []
  }
];
