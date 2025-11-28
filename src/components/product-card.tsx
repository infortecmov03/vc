'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const { toast } = useToast();

  const isVariationFamily = product.id === '1';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart(product)) {
      toast({
        title: 'Produto adicionado',
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Fora de estoque',
        description: `Não há estoque suficiente para ${product.name}.`,
      });
    }
  };

  const cartItem = cartItems.find(item => item.id === product.id);
  const stock = product.stock - (cartItem?.quantity || 0);
  
  const productLink = isVariationFamily ? `/products/1` : `/products/${product.id}`;


  return (
    <Link href={productLink} className="flex h-full">
        <Card className="flex h-full w-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
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
            <CardTitle className="truncate">{product.name}</CardTitle>
            <CardDescription className="line-clamp-2 min-h-[2.5rem]">{product.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">MT{product.price.toFixed(2)}</p>
             {!isVariationFamily && (
                <p className="text-sm text-muted-foreground">
                    {stock > 0 ? `${stock} em estoque` : 'Fora de estoque'}
                </p>
             )}
            </div>
        </CardContent>
        <CardFooter>
            {isVariationFamily ? (
                 <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <div className='text-center'>Ver opções</div>
                 </Button>
            ) : (
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart} disabled={stock === 0}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Adicionar ao Carrinho
                </Button>
            )}
        </CardFooter>
        </Card>
    </Link>
  );
}
