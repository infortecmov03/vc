'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSheet } from '@/components/cart-sheet';
import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            Bazar Moçambique AI
          </a>
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag />
              <span className="sr-only">Open cart</span>
            </Button>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </header>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
