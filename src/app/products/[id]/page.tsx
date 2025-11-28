'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { Recommendations } from '@/components/recommendations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProductDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { addToCart, cartItems } = useCart();
  const id = typeof params.id === 'string' ? params.id : '';

  const { firestore } = useFirebase();

  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);

  const { data: products, isLoading: areProductsLoading } = useCollection<Product>(productsQuery);

  // Find all related product variations for "Quadros"
  const productFamily = useMemo(() => {
    if (!products) return [];
    if (id === '1') {
      return products.filter(p => p.id.startsWith('1-'));
    }
    const singleProduct = products.find(p => p.id === id);
    return singleProduct ? [singleProduct] : [];
  }, [id, products]);

  const baseProduct = useMemo(() => {
    if (!products) return undefined;
    const product = productFamily[0];
    if (product) return product;

    // For single products not in a family
    return products.find(p => p.id === id);
  }, [productFamily, products, id]);

  const [selectedVariant, setSelectedVariant] = useState<Product | undefined>(baseProduct);
  
  useEffect(() => {
    if (!selectedVariant && baseProduct) {
        setSelectedVariant(baseProduct);
    }
  }, [baseProduct, selectedVariant]);


  useEffect(() => {
    if (selectedVariant && products) {
      const storedHistoryJSON = localStorage.getItem('browsingHistory');
      let history: Product[] = storedHistoryJSON ? JSON.parse(storedHistoryJSON) : [];
      
      const familyIds = productFamily.map(p => p.id);
      
      // Remove any other variant from the same family before adding the new one
      history = history.filter(p => !familyIds.includes(p.id));

      if (!history.find(p => p.id === selectedVariant.id)) {
        history.push(selectedVariant);
        if (history.length > 6) {
          history = history.slice(history.length - 6);
        }
        localStorage.setItem('browsingHistory', JSON.stringify(history));
      }
    }
  }, [selectedVariant, productFamily, products]);

  if (areProductsLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1">
                <div className="container py-8 md:py-12">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-12 w-48" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
  }

  if (!baseProduct) {
    return notFound();
  }
  
  const handleAddToCart = () => {
    if (selectedVariant && addToCart(selectedVariant)) {
      toast({
        title: 'Produto adicionado',
        description: `${selectedVariant.name} foi adicionado ao seu carrinho.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Fora de estoque',
        description: `Não há estoque suficiente para ${selectedVariant?.name}.`,
      });
    }
  };
  
  const cartItem = cartItems.find(item => item.id === selectedVariant?.id);
  const stock = (selectedVariant?.stock || 0) - (cartItem?.quantity || 0);

  const isQuadros = baseProduct.id.startsWith('1-');

  const quadroTypes = useMemo(() => {
    if (!isQuadros) return [];
    const types = productFamily.map(p => p.name.substring(0, p.name.lastIndexOf('(') -1));
    return [...new Set(types)];
  }, [isQuadros, productFamily]);

  const quadroSizes = useMemo(() => {
     if (!isQuadros) return [];
     const sizes = productFamily.map(p => p.name.substring(p.name.lastIndexOf('(') + 1, p.name.lastIndexOf(')')));
     return [...new Set(sizes)];
  }, [isQuadros, productFamily]);

  const [selectedType, setSelectedType] = useState(quadroTypes[0] || '');
  const [selectedSize, setSelectedSize] = useState(quadroSizes[0] || '');

  useEffect(() => {
    if (isQuadros) {
        const currentType = selectedVariant?.name.substring(0, selectedVariant.name.lastIndexOf('(') -1) || quadroTypes[0];
        const currentSize = selectedVariant?.name.substring(selectedVariant.name.lastIndexOf('(') + 1, selectedVariant.name.lastIndexOf(')')) || quadroSizes[0];
        setSelectedType(currentType);
        setSelectedSize(currentSize);
    }
  }, [isQuadros, selectedVariant, quadroTypes, quadroSizes]);
  
  useEffect(() => {
    if (isQuadros && selectedType && selectedSize) {
        const variant = productFamily.find(p => p.name === `${selectedType} (${selectedSize})`);
        setSelectedVariant(variant);
    }
  }, [selectedType, selectedSize, isQuadros, productFamily]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative aspect-square">
              <Image
                src={selectedVariant?.imageUrl || baseProduct.imageUrl}
                alt={selectedVariant?.name || baseProduct.name}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint={selectedVariant?.imageHint || baseProduct.imageHint}
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">{isQuadros ? "Quadros Artísticos" : baseProduct.name}</h1>
               {isQuadros && <p className="text-xl font-medium">{selectedVariant?.name}</p>}
              <p className="text-muted-foreground">{baseProduct.description}</p>
              
              {isQuadros && (
                <div className="flex gap-4">
                    <div className="grid w-full sm:w-auto">
                        <Label htmlFor="type-filter">Tipo</Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger id="type-filter" className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Escolha o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {quadroTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full sm:w-auto">
                        <Label htmlFor="size-filter">Tamanho</Label>
                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                            <SelectTrigger id="size-filter" className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Escolha o tamanho" />
                            </SelectTrigger>
                            <SelectContent>
                                {quadroSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              )}

              <p className="text-3xl font-bold text-primary">MT{(selectedVariant?.price || 0).toFixed(2)}</p>
               <p className="text-sm text-muted-foreground">
                {stock > 0 ? `${stock} em estoque` : 'Fora de estoque'}
              </p>
              <Button size="lg" onClick={handleAddToCart} disabled={stock === 0 || !selectedVariant} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
          <div className="mt-16">
            <Recommendations />
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construído por Bazar Moçambique. Todos os direitos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}
