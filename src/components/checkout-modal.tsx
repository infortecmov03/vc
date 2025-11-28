'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirebase } from '@/firebase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  address: z.string().min(10, { message: 'O endereço deve ter pelo menos 10 caracteres.' }),
});

export function CheckoutModal({ isOpen, onOpenChange }: CheckoutModalProps) {
  const router = useRouter();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [availableDiscount, setAvailableDiscount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  
  const discountToApply = Math.min(availableDiscount, totalPrice);
  const finalPrice = isDiscountApplied ? totalPrice - discountToApply : totalPrice;


  useEffect(() => {
    async function fetchUserDiscount() {
      if (firestore && user && isOpen) {
        setIsLoadingDiscount(true);
        const userRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setAvailableDiscount(userSnap.data()?.availableDiscount || 0);
        }
        setIsLoadingDiscount(false);
      }
    }
    fetchUserDiscount();
  }, [firestore, user, isOpen]);

  useEffect(() => {
    // Reset discount when modal closes
    if (!isOpen) {
      setIsDiscountApplied(false);
    }
  }, [isOpen]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const orderData = {
      userId: user?.uid || 'anonymous',
      ...values,
      orderDate: serverTimestamp(),
      totalAmount: finalPrice,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      sellerId: 'default-seller', // Placeholder until multi-seller logic is implemented
      discountApplied: isDiscountApplied ? discountToApply : 0,
    };
    
    if (firestore) {
      const ordersCollection = collection(firestore, 'orders');
      addDocumentNonBlocking(ordersCollection, orderData);

      // Deduct used discount from user's balance
      if (isDiscountApplied && user && discountToApply > 0) {
        const userRef = doc(firestore, 'users', user.uid);
        const newDiscountBalance = availableDiscount - discountToApply;
        await updateDoc(userRef, {
            availableDiscount: newDiscountBalance
        });
      }
    }
    
    clearCart();
    onOpenChange(false);

    router.push('/confirmation');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
          <DialogDescription>
            Por favor, preencha seus dados para completar o pedido.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Sua rua, número, cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoadingDiscount && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            )}
            
            {!isLoadingDiscount && availableDiscount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        Você tem MT{availableDiscount.toFixed(2)} de desconto!
                      </p>
                      {isDiscountApplied && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          -MT{discountToApply.toFixed(2)} aplicados a esta compra.
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={isDiscountApplied ? "secondary" : "default"}
                    size="sm"
                    onClick={() => setIsDiscountApplied(!isDiscountApplied)}
                  >
                    {isDiscountApplied ? 'Remover' : 'Aplicar'}
                  </Button>
                </div>
              </div>
            )}


            <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                <span>Total a Pagar:</span>
                <span>MT{finalPrice.toFixed(2)}</span>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Confirmar Pedido
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    