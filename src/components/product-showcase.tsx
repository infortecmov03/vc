'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { ProductList } from './product-list';
import { Recommendations } from './recommendations';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { collection, query, getDocs, writeBatch } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from './ui/skeleton';
import { initialProducts } from '@/lib/products';

export function ProductShowcase() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const { firestore } = useFirebase();

  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);

  const { data: allProducts, isLoading: areProductsLoading } = useCollection<Product>(productsQuery);
  
  // Seed database on initial load if it's empty
  useEffect(() => {
    const seedDatabase = async () => {
      if (firestore && allProducts && allProducts.length === 0) {
        console.log('Product collection is empty. Seeding database...');
        const productsRef = collection(firestore, 'products');
        const batch = writeBatch(firestore);
        initialProducts.forEach((product) => {
          const docRef = doc(productsRef, product.id);
          batch.set(docRef, product);
        });
        await batch.commit();
        // The useCollection hook will automatically update the UI with the new products.
        console.log('Database seeded successfully!');
      }
    };

    // We check areProductsLoading to ensure we have a definitive answer on whether products exist or not.
    if (!areProductsLoading) {
      seedDatabase();
    }
  }, [allProducts, areProductsLoading, firestore]);
  
  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const categories = useMemo(() => {
      if (!allProducts) return ['all'];
      return ['all', ...Array.from(new Set(allProducts.map(p => p.category)))]
    }, [allProducts]);
  
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(product => {
        const categoryMatch = category === 'all' || product.category === category;
        const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
        return categoryMatch && priceMatch;
    });
  }, [allProducts, category, priceRange]);
  
  const productsByCategory = useMemo(() => {
    if (!filteredProducts) return {};
    // For "Quadros Artisticos", show only one card that links to the family page.
    const quadros = filteredProducts.filter(p => p.category === 'Quadros Artisticos');
    const otherProducts = filteredProducts.filter(p => p.category !== 'Quadros Artisticos');
    
    let displayProducts: Product[] = otherProducts;

    if (quadros.length > 0 && (category === 'all' || category === 'Quadros Artisticos')) {
       // We create a representative product for the card
        const representativeQuadro: Product = {
            id: '1',
            name: 'Quadros Artísticos',
            description: 'Quadros artísticos com mensagens inspiradoras, perfeitos para decorar qualquer ambiente.',
            price: 1000, // Base price
            imageUrl: 'https://i.postimg.cc/ht51fqKK/2025-10-26-22-26-45.jpg',
            category: 'Quadros Artisticos',
            stock: quadros.reduce((sum, p) => sum + p.stock, 0), // Sum stock of all variations
            imageHint: 'quadro artistico',
        };
        // Remove individual quadros if we are showing the representative one
        displayProducts = [representativeQuadro, ...otherProducts.filter(p => !p.id.startsWith('1-'))];
    }


    return displayProducts.reduce((acc, product) => {
        // Don't show individual quadro variations on the main page
        if (product.id.startsWith('1-')) return acc;

        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts, category]);

  const ShowcaseSkeleton = () => (
    <div className="space-y-10">
        <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
         <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <Recommendations />
      
      <div>
        <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Nossos Produtos</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid w-full sm:w-auto">
                    <Label htmlFor="category-filter">Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category-filter" className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Todas' : cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid w-full sm:w-auto">
                    <Label>Preço (MT{priceRange[0]} - MT{priceRange[1]})</Label>
                    <Slider
                        min={0}
                        max={5000}
                        step={100}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value)}
                        className="w-full sm:w-[200px]"
                    />
                </div>
            </div>
        </div>

        <div className="space-y-10">
            {areProductsLoading ? <ShowcaseSkeleton /> :
            Object.keys(productsByCategory).length > 0 ? (
                Object.entries(productsByCategory).map(([cat, products]) => (
                    <section key={cat}>
                        <h3 className="mb-4 text-2xl font-semibold">{cat}</h3>
                        <ProductList products={products} />
                    </section>
                ))
            ) : (
                <p className="text-center text-muted-foreground">Nenhum produto encontrado com os filtros selecionados.</p>
            )}
        </div>
      </div>
    </div>
  );
}

    