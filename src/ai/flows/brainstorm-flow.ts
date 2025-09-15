
'use server';
/**
 * @fileOverview An AI flow for brainstorming ideas.
 *
 * - brainstormIdeas - A function that generates related ideas for a given topic.
 * - BrainstormInput - The input type for the brainstormIdeas function.
 * - BrainstormOutput - The return type for the brainstormIdeas function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BrainstormInputSchema = z.string();
export type BrainstormInput = z.infer<typeof BrainstormInputSchema>;

const BrainstormOutputSchema = z.object({
  ideas: z.array(z.string()).describe('A list of 5-7 short, creative, and related ideas or sub-topics.'),
});
export type BrainstormOutput = z.infer<typeof BrainstormOutputSchema>;

export async function brainstormIdeas(topic: BrainstormInput): Promise<BrainstormOutput> {
  return brainstormFlow(topic);
}

const prompt = ai.definePrompt({
  name: 'brainstormPrompt',
  input: { schema: z.object({ topic: BrainstormInputSchema }) },
  output: { schema: BrainstormOutputSchema },
  prompt: `You are a creative brainstorming assistant. Your goal is to generate a list of related sub-topics or ideas for a given main topic.

The ideas should be concise and distinct from one another. Provide between 5 and 7 ideas.

Topic: {{{topic}}}`,
});

const brainstormFlow = ai.defineFlow(
  {
    name: 'brainstormFlow',
    inputSchema: BrainstormInputSchema,
    outputSchema: BrainstormOutputSchema,
  },
  async (topic) => {
    const { output } = await prompt({ topic });
    return output!;
  }
);
