'use server';

/**
 * @fileOverview A customer support chat flow.
 *
 * - chat - A function that handles a user's chat message and returns an AI-generated response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
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

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The chat history between the user and the AI.'),
  message: z.string().describe('The latest message from the user.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user\'s message.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


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

    // We create a representative product for the "Quadros" family
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

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [getAvailableProducts],
  system: `You are a friendly and helpful customer support AI for an online store called "Bazar Moçambique AI".
  Your role is to assist users with their questions about products, orders, and the store in general.
  Be conversational and provide clear, concise answers.
  If a user asks about available products, use the getAvailableProducts tool to provide accurate information.`,
  prompt: (input) => [
      ...input.history,
      { role: 'user', content: input.message }
    ],
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const response = await chatPrompt(input);
    return { response: response.text };
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
