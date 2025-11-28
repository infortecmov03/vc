'use client';

import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProductList } from './product-list';
import type { Product } from '@/lib/types';
import { recommendProducts } from '@/ai/flows/product-recommendations';
import { useToast } from '@/hooks/use-toast';
import { products as allProductsStore } from '@/lib/products';
import type { ProductSchema } from '@/ai/flows/product-recommendations';

interface RecommendationsProps {
  browsingHistory: Product[];
}

export function Recommendations({ browsingHistory }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (browsingHistory.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Histórico de navegação vazio',
        description: 'Navegue por alguns produtos primeiro para obter recomendações.',
      });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      const result: ProductSchema[] = await recommendProducts({
        userPreferences: 'Gosto de arte moderna e gadgets úteis. Prefiro produtos com boas avaliações e preços moderados.',
        browsingHistory: browsingHistory.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            imageUrl: p.imageUrl,
            category: p.category,
            stock: p.stock,
        })),
      });
      
      const mappedResults: Product[] = result.map(rec => {
        const productFromStore = allProductsStore.find(p => p.id === rec.id);
        return productFromStore || { ...rec, imageHint: '' };
      }).filter(Boolean) as Product[];

      setRecommendations(mappedResults);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao obter recomendações',
        description: 'Ocorreu um problema ao se comunicar com a IA. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recomendações de IA para você</h2>
          <p className="text-muted-foreground">Com base no seu histórico de navegação. Clique em um produto para adicioná-lo ao seu histórico.</p>
        </div>
        <Button onClick={handleGetRecommendations} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Gerando...' : 'Obter Recomendações'}
        </Button>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6">
          <ProductList products={recommendations} onProductClick={() => {}} />
        </div>
      )}
      
      {!isLoading && recommendations.length === 0 && browsingHistory.length > 0 && (
         <div className="mt-6 text-center text-muted-foreground">
            <p>Clique em "Obter Recomendações" para ver sugestões personalizadas.</p>
         </div>
      )}
    </section>
  );
}
