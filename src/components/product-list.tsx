import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';

interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductList({ products, onProductClick }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
      ))}
    </div>
  );
}
