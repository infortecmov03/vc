'use server';

/**
 * @fileOverview Shared Zod schemas for AI product flows.
 */

import {z} from 'genkit';

export const ProductSchema = z.object({
  id: z.string().describe('The unique identifier of the product.'),
  name: z.string().describe('The name of the product.'),
  description: z.string().describe('A brief description of the product.'),
  price: z.number().describe('The price of the product.'),
  imageUrl: z.string().describe('URL of the product image.'),
  category: z.string().describe('Category of the product (e.g., Quadros Artisticos, Smart Tag Rastreador).'),
  stock: z.number().describe('The number of items currently in stock.'),
});
