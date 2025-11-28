import type { Product } from '@/lib/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Abstract Art Canvas',
    description: 'A beautiful abstract art piece on canvas, perfect for modern living spaces.',
    price: 3200.00,
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    category: 'Quadros Artisticos',
    stock: 10,
    imageHint: 'abstract art'
  },
  {
    id: '2',
    name: 'Smart Tag Rastreador',
    description: 'Never lose your keys, wallet, or bag again with this bluetooth smart tracker.',
    price: 1600.00,
    imageUrl: 'https://picsum.photos/seed/2/600/400',
    category: 'Smart Tag Rastreador',
    stock: 20,
    imageHint: 'smart tag'
  },
  {
    id: '3',
    name: 'Modern Art Print',
    description: 'A vibrant and modern art print to add a pop of color to your home decor.',
    price: 2500.00,
    imageUrl: 'https://picsum.photos/seed/3/600/400',
    category: 'Quadros Artisticos',
    stock: 5,
    imageHint: 'modern print'
  },
];
