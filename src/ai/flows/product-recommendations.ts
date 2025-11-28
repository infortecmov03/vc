'use server';

/**
 * @fileOverview Product recommendations flow based on user preferences and browsing history.
 *
 * - recommendProducts - A function that recommends products based on user preferences and browsing history.
 * - RecommendProductsInput - The input type for the recommendProducts function.
 * - RecommendProductsOutput - The return type for the recommendProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSchema = z.object({
  id: z.string().describe('The unique identifier of the product.'),
  name: z.string().describe('The name of the product.'),
  description: z.string().describe('A brief description of the product.'),
  price: z.number().describe('The price of the product.'),
  imageUrl: z.string().describe('URL of the product image.'),
  category: z.string().describe('Category of the product (e.g., Quadros Artisticos, Smart Tag Rastreador).'),
  stock: z.number().describe('The number of items currently in stock.'),
});

const RecommendProductsInputSchema = z.object({
  userPreferences: z
    .string()
    .describe(
      'A description of the user preferences, including preferred categories and price ranges.'
    ),
  browsingHistory: z
    .array(ProductSchema)
    .describe('An array of products representing the user browsing history.'),
});
export type RecommendProductsInput = z.infer<typeof RecommendProductsInputSchema>;

const RecommendProductsOutputSchema = z.array(ProductSchema).describe('An array of recommended products.');
export type RecommendProductsOutput = z.infer<typeof RecommendProductsOutputSchema>;

const getAvailableProducts = ai.defineTool({
  name: 'getAvailableProducts',
  description: 'Retrieves a list of available products from the store.',
  inputSchema: z.object({category: z.string().optional().describe('Filter products by category')}),
  outputSchema: z.array(ProductSchema),
}, async (input) => {
  // TODO: Replace with actual implementation to fetch products from the database.
  // This is dummy data for demonstration purposes.
  const products: ProductSchema[] = [
    {
      id: '1',
      name: 'Abstract Art Canvas',
      description: 'A beautiful abstract art piece on canvas.',
      price: 3200.00,
      imageUrl: '/images/abstract_art.jpg',
      category: 'Quadros Artisticos',
      stock: 10,
    },
    {
      id: '2',
      name: 'Smart Tag Rastreador',
      description: 'A smart tag to track your belongings.',
      price: 1600.00,
      imageUrl: '/images/smart_tag.jpg',
      category: 'Smart Tag Rastreador',
      stock: 20,
    },
    {
      id: '3',
      name: 'Modern Art Print',
      description: 'A modern art print for your home decor.',
      price: 2500.00,
      imageUrl: '/images/modern_art.jpg',
      category: 'Quadros Artisticos',
      stock: 5,
    },
  ];

  return products.filter(product => !input.category || product.category === input.category);
});

const recommendProductsPrompt = ai.definePrompt({
  name: 'recommendProductsPrompt',
  input: {schema: RecommendProductsInputSchema},
  output: {schema: RecommendProductsOutputSchema},
  tools: [getAvailableProducts],
  prompt: `Based on the user's preferences: {{{userPreferences}}} and browsing history: {{#each browsingHistory}}{{{this.name}}}, {{/each}}, recommend products from the store.

  You can use the getAvailableProducts tool to explore the available products.
  Make sure to return ONLY available products.
  Return an array of products that the user would be most interested in. Consider their past browsing history.
  `,
});

const recommendProductsFlow = ai.defineFlow(
  {
    name: 'recommendProductsFlow',
    inputSchema: RecommendProductsInputSchema,
    outputSchema: RecommendProductsOutputSchema,
  },
  async input => {
    const {output} = await recommendProductsPrompt(input);
    return output!;
  }
);

export async function recommendProducts(input: RecommendProductsInput): Promise<RecommendProductsOutput> {
  return recommendProductsFlow(input);
}

export type {ProductSchema};