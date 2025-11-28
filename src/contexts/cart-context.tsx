'use client';

import type { Product, ProductVariation } from '@/lib/types';
import { products as allProducts } from '@/lib/products';
import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product | ProductVariation, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    } catch (error) {
        console.error("Failed to parse cart items from localStorage", error);
        setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product | ProductVariation, quantity = 1): boolean => {
    let success = false;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      const availableStock = product.stock;
      const cartQuantity = existingItem ? existingItem.quantity : 0;
      
      if (availableStock >= cartQuantity + quantity) {
        success = true;
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        
        // Find the full product details from the main products list
        const productInStore = allProducts.find(p => p.id === product.id);

        if (productInStore) {
            return [...prevItems, { ...productInStore, quantity }];
        }
        
        // Fallback for items not directly in the main list (like variations)
        const productToAdd: Product = {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl,
            imageHint: product.imageHint,
            // Try to find parent product for more details
            description: allProducts.find(p => p.variations?.some(v => v.id === product.id))?.description || '',
            category: allProducts.find(p => p.variations?.some(v => v.id === product.id))?.category || allProducts.find(p => p.id === product.id)?.category || '',
            variations: []
        };
        
        return [...prevItems, { ...productToAdd, quantity }];
      }
      
      success = false;
      return prevItems;
    });
    return success;
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);
  
  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);


  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
