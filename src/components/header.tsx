'use client';

import { Menu, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CartSheet } from '@/components/cart-sheet';
import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between gap-4">
          <a href="/" className="text-2xl font-bold text-primary">
            Bazar Moçambique AI
          </a>
          <div className="hidden flex-1 md:flex justify-center">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Pesquisar produtos..." className="pl-10" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
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
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 py-6">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Pesquisar produtos..." className="pl-10" />
                    </div>
                    <Button variant="ghost" className="justify-start gap-2" onClick={() => {
                        const menuTrigger = document.querySelector('[aria-controls="radix-:R1mlaq:"]');
                        if (menuTrigger instanceof HTMLElement) {
                            menuTrigger.click();
                        }
                        setIsCartOpen(true)
                    }}>
                        <ShoppingBag />
                        Carrinho ({totalItems})
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
