'use client';

import { useState, useTransition } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { searchProducts } from '@/ai/flows/product-search';
import { ProductSchema } from '@/ai/flows/product-schemas';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<z.infer<typeof ProductSchema>[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const { toast } = useToast();

  const handleSearch = () => {
    if (!query) return;

    startSearchTransition(async () => {
      try {
        const searchResults = await searchProducts({ query });
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        toast({
          variant: 'destructive',
          title: 'Falha na busca',
          description:
            'Ocorreu um erro ao buscar os produtos. Tente novamente.',
        });
      }
    });
  };

  const productLink = (product: z.infer<typeof ProductSchema>) => {
    return product.id === '1' ? `/products/1` : `/products/${product.id}`;
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full max-w-md hidden md:flex justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Pesquisar produtos...
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Pesquisar Produtos</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: quadros com mensagens de fé"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search />
              )}
              <span className="sr-only">Search</span>
            </Button>
          </div>
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {isSearching && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isSearching && results.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {results.map((product) => (
                  <Link
                    href={productLink(product)}
                    key={product.id}
                    className="flex items-center gap-4 rounded-md p-2 hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-primary font-bold">
                        MT{product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!isSearching &&
              results.length === 0 &&
              query &&
              !isSearching && (
                <p className="text-center text-muted-foreground p-8">
                  Nenhum produto encontrado para &quot;{query}&quot;.
                </p>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
