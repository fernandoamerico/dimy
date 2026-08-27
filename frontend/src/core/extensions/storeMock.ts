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
    screenshots: [],
    reviews: [],
    createdAt: '2026-01-10'
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
    screenshots: [],
    reviews: [],
    createdAt: '2026-03-20'
  }
];
