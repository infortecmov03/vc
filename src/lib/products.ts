import type { Product } from '@/lib/types';

// This data is used to seed the Firestore database on the first load.
// After the first load, product data is managed in the Firebase console.

export const initialProducts: Product[] = [
  {
    id: '1-a4-amor',
    name: 'Quadro Fé, Esperança e Amor (A4)',
    description: 'Decore seu ambiente com mensagens de fé, esperança e amor. Ideal para presentear ou para trazer inspiração ao seu lar.',
    category: 'Quadros Artisticos',
    stock: 10,
    imageUrl: 'https://i.postimg.cc/9QG7wG7f/2024-10-26-22-26-45.jpg',
    imageHint: 'quadro artistico',
    price: 1200
  },
  {
    id: '1-a3-amor',
    name: 'Quadro Fé, Esperança e Amor (A3)',
    description: 'Decore seu ambiente com mensagens de fé, esperança e amor. Ideal para presentear ou para trazer inspiração ao seu lar.',
    category: 'Quadros Artisticos',
    stock: 5,
    imageUrl: 'https://i.postimg.cc/9QG7wG7f/2024-10-26-22-26-45.jpg',
    imageHint: 'quadro artistico',
    price: 1800
  },
  {
    id: '1-a4-familia',
    name: 'Quadro Definição de Família (A4)',
    description: 'Uma bela definição de família para aquecer o coração e decorar sua casa com o que mais importa.',
    category: 'Quadros Artisticos',
    stock: 12,
    imageUrl: 'https://i.postimg.cc/ht51fqKK/2025-10-26-22-26-45.jpg',
    imageHint: 'quadro familia',
    price: 1200
  },
  {
    id: '1-a3-familia',
    name: 'Quadro Definição de Família (A3)',
    description: 'Uma bela definição de família para aquecer o coração e decorar sua casa com o que mais importa.',
    category: 'Quadros Artisticos',
    stock: 7,
    imageUrl: 'https://i.postimg.cc/ht51fqKK/2025-10-26-22-26-45.jpg',
    imageHint: 'quadro familia',
    price: 1800
  },
  {
    id: '2',
    name: 'Smart Tag - Rastreador',
    description: 'Nunca mais perca suas chaves, carteira ou mala. Este rastreador inteligente ajuda você a localizar seus pertences com facilidade.',
    category: 'Smart Tag Rastreador',
    stock: 25,
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_909774-MLU75727192777_042024-O.webp',
    imageHint: 'smart tag',
    price: 950
  }
];

    