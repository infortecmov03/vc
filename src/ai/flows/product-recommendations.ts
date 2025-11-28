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
import { ProductSchema } from './product-schemas';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

let app: App;
if (!getApps().length) {
  app = initializeApp();
} else {
  app = getApps()[0];
}
const firestore = getFirestore(app);


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
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firestore.collection('products');
  if (input.category) {
    query = query.where('category', '==', input.category);
  }
  const productsSnapshot = await query.get();
  const products: z.infer<typeof ProductSchema>[] = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        category: data.category,
        stock: data.stock,
      };
    });
  return products;
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
