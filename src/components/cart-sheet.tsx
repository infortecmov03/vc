'use client';

import Image from 'next/image';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { CheckoutModal } from './checkout-modal';
import { Trash2 } from 'lucide-react';

interface CartSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, totalPrice, totalItems } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    onOpenChange(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Carrinho ({totalItems})</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
          {cartItems.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-6 p-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                      data-ai-hint={item.imageHint}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            </div>
          )}
          </div>
          {cartItems.length > 0 && (
            <>
              <Separator />
              <SheetFooter className="p-6">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Finalizar Compra
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
      <CheckoutModal isOpen={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  );
}
