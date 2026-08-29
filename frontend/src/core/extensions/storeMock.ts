export interface StoreReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface StoreExtension {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  iconName: string;
  author: string;
  rating: number;
  downloads: number;
  price: 'free' | 'paid';
  isRecommended: boolean;
  screenshots: string[];
  reviews: StoreReview[];
  createdAt: string;
}

export const STORE_MOCK_DATA: StoreExtension[] = [
  {
    id: 'core_publications',
    name: 'Publicações (Blog & Portfólio)',
    description: 'Crie e gerencie categorias de conteúdo como Blog, Serviços e Portfólio.',
    longDescription: `
      O aplicativo de Publicações é o coração de qualquer site focado em conteúdo.
      Com ele, você pode criar facilmente diferentes tipos de coleções, como:
      - Posts para um Blog completo.
      - Portfólio de projetos ou serviços prestados.
      - Depoimentos de clientes.
      
      Tudo isso gerenciado através de uma interface intuitiva onde você pode definir título, capa, conteúdo e definir se a categoria é pública ou restrita a usuários logados.
    `,
    iconName: 'Newspaper',
    author: 'Equipe Dimy',
    rating: 5.0,
    downloads: 12500,
    price: 'free',
    isRecommended: true,
    screenshots: [],
    reviews: [],
    createdAt: '2026-01-10'
  },
  {
    id: 'core_pages',
    name: 'Páginas',
    description: 'Crie páginas únicas com estrutura dinâmica (Ex: Sobre Nós, Home).',
    longDescription: `
      Com o aplicativo de Páginas, você cria e gerencia páginas únicas do seu site com total flexibilidade.
      - Crie páginas como "Sobre Nós", "Home" ou "Contato".
      - Monte blocos de conteúdo ricos com texto, imagens e outros componentes.
      - Ideal para conteúdo estático e institucional do seu site.
    `,
    iconName: 'FileText',
    author: 'Equipe Dimy',
    rating: 5.0,
    downloads: 10800,
    price: 'free',
    isRecommended: true,
    screenshots: [],
    reviews: [],
    createdAt: '2026-01-15'
  },
  {
    id: 'business_info',
    name: 'Meu Negócio',
    description: 'Gerencie informações centrais do seu negócio (Nome, Logo, CNPJ, Contatos, Redes Sociais).',
    longDescription: `
      O aplicativo "Meu Negócio" centraliza os dados públicos da sua empresa.
      Configurando os dados aqui, seu site pode puxar automaticamente logo, nome, links sociais, telefone de contato e endereço, facilitando a manutenção.
    `,
    iconName: 'Briefcase',
    author: 'Equipe Dimy',
    rating: 5.0,
    downloads: 9000,
    price: 'free',
    isRecommended: true,
    screenshots: [],
    reviews: [],
    createdAt: '2026-08-27'
  },
  {
    id: 'schema_products',
    name: 'Catálogo de Produtos',
    description: 'Catálogo de produtos com preços e estoque.',
    longDescription: `
      Transforme seu site em uma vitrine virtual com o aplicativo de Catálogo de Produtos.
      - Adicione produtos com nome, descrição rica, preço e controle de estoque.
      - Faça o upload da imagem principal do produto.
      - Organize sua vitrine de forma profissional e conecte com seu front-end para exibir aos clientes.
    `,
    iconName: 'Package',
    author: 'Equipe Dimy',
    rating: 5.0,
    downloads: 8300,
    price: 'free',
    isRecommended: true,
    screenshots: [],
    reviews: [],
    createdAt: '2026-02-15'
  },
  {
    id: 'schema_sliders',
    name: 'Galeria & Banners',
    description: 'Crie e gerencie slides e banners para qualquer parte do site.',
    longDescription: `
      Crie carrosséis dinâmicos e galerias de imagens incríveis.
      Com este aplicativo, você pode agrupar imagens (ex: "home-hero", "parceiros"), definir ordem, títulos e links para botões.
      A maneira mais fácil de manter a parte visual do seu site sempre atualizada.
    `,
    iconName: 'Images',
    author: 'Equipe Dimy',
    rating: 5.0,
    downloads: 18200,
    price: 'free',
    isRecommended: true,
    screenshots: [],
    reviews: [],
    createdAt: '2026-03-20'
  },
  {
    id: 'cloudflare_r2',
    name: 'Cloudflare R2',
    description: 'Armazene todas as imagens e mídias do seu CMS na nuvem da Cloudflare sem taxa de egress.',
    longDescription: `
      Conecte o seu Dimy ao Cloudflare R2, uma alternativa S3-compatible rápida e barata.
      - Upload direto para a nuvem.
      - Zero taxas de saída de dados (egress).
      - Carregamento rápido de imagens para todos os seus clientes globais.
    `,
    iconName: 'Cloud',
    author: 'Equipe Dimy',
    rating: 5.0,
    downloads: 5000,
    price: 'free',
    isRecommended: false,
    screenshots: [],
    reviews: [],
    createdAt: '2026-06-01'
  },
  {
    id: 'supabase_storage',
    name: 'Supabase Storage',
    description: 'Armazene imagens e arquivos do Dimy nos buckets integrados do seu projeto Supabase.',
    longDescription: 'Ative esta extensão para que todos os uploads de imagens (como logos, avatares e mídias do site) sejam enviados diretamente para o Storage do seu projeto Supabase.\n\nEvite sobrecarregar o armazenamento local do seu servidor (SQLite) utilizando uma solução de nuvem profissional de ponta.',
    iconName: 'Cloud',
    author: 'Equipe Dimy',
    rating: 4.8,
    downloads: 1800,
    price: 'free',
    isRecommended: false,
    screenshots: [],
    reviews: [],
    createdAt: '2026-08-28'
  },
  {
    id: 'supabase_config',
    name: 'Supabase',
    description: 'Conecte o Dimy ao Supabase para garantir a persistência dos seus dados na nuvem.',
    longDescription: `
      Sem o Supabase, seus dados são armazenados localmente no SQLite, o que não é persistente entre atualizações de container.
      Configurando o Supabase, você garante que os dados estarão seguros em um banco PostgreSQL hospedado.
    `,
    iconName: 'Database',
    author: 'Equipe Dimy',
    rating: 5.0,
    downloads: 15000,
    price: 'free',
    isRecommended: true,
    screenshots: [],
    reviews: [],
    createdAt: '2026-08-28'
  }
];
