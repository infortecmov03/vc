'use server';

/**
 * @fileOverview Product search flow using natural language.
 *
 * - searchProducts - A function that searches for products based on a user query.
 * - SearchProductsInput - The input type for the searchProducts function.
 * - SearchProductsOutput - The return type for the searchProducts function.
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

const SearchProductsInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
});
export type SearchProductsInput = z.infer<typeof SearchProductsInputSchema>;

const SearchProductsOutputSchema = z.array(ProductSchema).describe('An array of products matching the query.');
export type SearchProductsOutput = z.infer<typeof SearchProductsOutputSchema>;

const getAvailableProducts = ai.defineTool({
  name: 'getAvailableProducts',
  description: 'Retrieves a list of all available products from the store.',
  inputSchema: z.object({}),
  outputSchema: z.array(ProductSchema),
}, async () => {
    const productsSnapshot = await firestore.collection('products').get();
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

    // Create a representative product for the "Quadros" family for better search results
    const quadros = products.filter(p => p.category === 'Quadros Artisticos');
    if (quadros.length > 0) {
        const representativeQuadro: z.infer<typeof ProductSchema> = {
            id: '1',
            name: 'Quadros Artísticos',
            description: 'Quadros artísticos com mensagens inspiradoras, perfeitos para decorar qualquer ambiente.',
            price: 1000,
            imageUrl: 'https://i.postimg.cc/ht51fqKK/2025-10-26-22-26-45.jpg',
            category: 'Quadros Artisticos',
            stock: 5,
        };
        const otherProducts = products.filter(p => p.category !== 'Quadros Artisticos');
        return [representativeQuadro, ...otherProducts];
    }
    
    return products;
});


const searchProductsPrompt = ai.definePrompt({
  name: 'searchProductsPrompt',
  input: {schema: SearchProductsInputSchema},
  output: {schema: SearchProductsOutputSchema},
  tools: [getAvailableProducts],
  prompt: `You are a helpful and friendly AI assistant for an online store called "Bazar Moçambique AI".
Your task is to help users find products based on their search query: {{{query}}}.

Use the getAvailableProducts tool to get the full list of products available in the store.
Analyze the user's query and the product list (name, description, category) to find the most relevant products.
Return an array of products that best match the query. If no products match, return an empty array.
Be smart about the matching. For example, if a user searches for "decoração para parede", "Quadros Artísticos" is a good match.
If the user searches for "localizador", "Smart Tag - Rastreador" is a good match.
Return only products from the store.
`,
});

const searchProductsFlow = ai.defineFlow(
  {
    name: 'searchProductsFlow',
    inputSchema: SearchProductsInputSchema,
    outputSchema: SearchProductsOutputSchema,
  },
  async input => {
    const {output} = await searchProductsPrompt(input);
    return output!;
  }
);

export async function searchProducts(input: SearchProductsInput): Promise<SearchProductsOutput> {
  return searchProductsFlow(input);
}
