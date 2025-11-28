'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { ProductList } from './product-list';
import { Recommendations } from './recommendations';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from 'next/navigation';

interface ProductShowcaseProps {
  allProducts: Product[];
}

export function ProductShowcase({ allProducts }: ProductShowcaseProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  
  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const categories = useMemo(() => ['all', ...Array.from(new Set(allProducts.map(p => p.category)))], [allProducts]);
  
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
        const categoryMatch = category === 'all' || product.category === category;
        const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
        return categoryMatch && priceMatch;
    });
  }, [allProducts, category, priceRange]);
  
  const productsByCategory = useMemo(() => {
    // For "Quadros Artisticos", show only one card that links to the family page.
    const quadros = filteredProducts.find(p => p.category === 'Quadros Artisticos');
    const otherProducts = filteredProducts.filter(p => p.category !== 'Quadros Artisticos');
    
    let displayProducts = otherProducts;
    if (quadros && (category === 'all' || category === 'Quadros Artisticos')) {
       // We create a representative product for the card
        const representativeQuadro: Product = {
            id: '1',
            name: 'Quadros Artísticos',
            description: 'Quadros artísticos com mensagens inspiradoras, perfeitos para decorar qualquer ambiente.',
            price: 1000, // Base price
            imageUrl: 'https://i.postimg.cc/ht51fqKK/2025-10-26-22-26-45.jpg',
            category: 'Quadros Artisticos',
            stock: 5,
            imageHint: 'quadro artistico',
            variations: [],
        };
        displayProducts = [representativeQuadro, ...otherProducts];
    }


    return displayProducts.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts, category]);

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
            {Object.keys(productsByCategory).length > 0 ? (
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
