import { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  stock: number;
  imageUrl: string; 
  imageHint: string;
  price: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  userId: string;
  name: string;
  email: string;
  address: string;
  orderDate: Timestamp;
  totalAmount: number;
  items: OrderItem[];
  sellerId: string;
  deliveryFee: number;
  discountApplied: number;
};
