'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Card className="flex h-full cursor-pointer flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl" onClick={() => onProductClick(product)}>
      <div className="relative aspect-video">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          data-ai-hint={product.imageHint}
        />
      </div>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem]">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
           <p className="text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart} disabled={product.stock === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
}
