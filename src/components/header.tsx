'use client';

import { Menu, ShoppingBag, User as UserIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CartSheet } from '@/components/cart-sheet';
import { useState, useMemo } from 'react';
import { useCart } from '@/contexts/cart-context';
import { SearchDialog } from './search-dialog';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { products } from '@/lib/products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"


export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isUserLoading } = useUser();

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-bold text-primary">
              Bazar Moçambique AI
            </a>
            <nav className="hidden md:flex items-center gap-4">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    Categorias <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map(category => (
                    <Link href={`/?category=${encodeURIComponent(category)}`} key={category} legacyBehavior passHref>
                      <DropdownMenuItem asChild>
                        <a>{category}</a>
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="hidden flex-1 md:flex justify-center">
             <SearchDialog />
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
            {!isUserLoading && (
              user ? (
                 <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <UserIcon />
                    <span className="sr-only">Profile</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )
            )}
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <SearchDialog />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 py-6">
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
                     {!isUserLoading && (
                        user ? (
                          <Button variant="ghost" className="justify-start gap-2" asChild>
                            <Link href="/profile"><UserIcon /> Perfil</Link>
                          </Button>
                        ) : (
                           <Button variant="ghost" className="justify-start gap-2" asChild>
                            <Link href="/login">Login</Link>
                          </Button>
                        )
                      )}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                           <Button variant="ghost" className="w-full justify-between">
                            Categorias
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="flex flex-col pl-4">
                           {categories.map(category => (
                            <Link href={`/?category=${encodeURIComponent(category)}`} key={category} legacyBehavior passHref>
                                <Button variant="ghost" className="justify-start">
                                  {category}
                                </Button>
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
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
