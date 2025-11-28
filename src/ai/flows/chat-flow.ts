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
import { products as allProductsStore } from '@/lib/products';
import { ProductSchema } from './product-schemas';

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
    // We create a representative product for the "Quadros" family
    const representativeQuadro: z.infer<typeof ProductSchema> = {
        id: '1',
        name: 'Quadros Artísticos',
        description: 'Quadros artísticos com mensagens inspiradoras, perfeitos para decorar qualquer ambiente.',
        price: 1000,
        imageUrl: 'https://i.postimg.cc/ht51fqKK/2025-10-26-22-26-45.jpg',
        category: 'Quadros Artisticos',
        stock: 5,
    };

    const otherProducts = allProductsStore.filter(p => !p.id.startsWith('1-'));

    const storeProducts: z.infer<typeof ProductSchema>[] = [
        representativeQuadro,
        ...otherProducts.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            imageUrl: p.imageUrl,
            category: p.category,
            stock: p.stock,
        }))
    ];

    return storeProducts;
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
