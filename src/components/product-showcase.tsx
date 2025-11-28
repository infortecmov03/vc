'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductList } from './product-list';
import { Recommendations } from './recommendations';

interface ProductShowcaseProps {
  products: Product[];
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  const [browsingHistory, setBrowsingHistory] = useState<Product[]>([]);

  const handleProductClick = (product: Product) => {
    setBrowsingHistory((prevHistory) => {
      if (prevHistory.find((p) => p.id === product.id)) {
        return prevHistory;
      }
      return [...prevHistory.slice(-5), product];
    });
  };
  
  const artisticProducts = products.filter(p => p.category === 'Quadros Artisticos');
  const trackerProducts = products.filter(p => p.category === 'Smart Tag Rastreador');

  return (
    <div className="space-y-12">
      <Recommendations browsingHistory={browsingHistory} />
      
      <div>
        <h2 className="mb-6 text-3xl font-bold tracking-tight">Nossos Produtos</h2>
        <div className="space-y-10">
            <section>
                <h3 className="text-2xl font-semibold mb-4">Quadros Artísticos</h3>
                <ProductList products={artisticProducts} onProductClick={handleProductClick} />
            </section>
            <section>
                <h3 className="text-2xl font-semibold mb-4">Smart Tag - Rastreador</h3>
                <ProductList products={trackerProducts} onProductClick={handleProductClick} />
            </section>
        </div>
      </div>
    </div>
  );
}
