
'use server';
/**
 * @fileOverview A simple text generation AI agent.
 *
 * - generateText - A function that takes a prompt and returns AI-generated text.
 * - GenerateTextInput - The input type for the generateText function.
 * - GenerateTextOutput - The return type for the generateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTextInputSchema = z.object({
  prompt: z.string().describe('The text prompt to send to the AI model.'),
});
export type GenerateTextInput = z.infer<typeof GenerateTextInputSchema>;

const GenerateTextOutputSchema = z.object({
  text: z.string().describe('The generated text response from the AI model.'),
});
export type GenerateTextOutput = z.infer<typeof GenerateTextOutputSchema>;

export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
  return generateTextFlow(input);
}

const generateTextFlow = ai.defineFlow(
  {
    name: 'generateTextFlow',
    inputSchema: GenerateTextInputSchema,
    outputSchema: GenerateTextOutputSchema,
  },
  async ({ prompt }) => {
    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash-preview',
      config: { temperature: 0.7 },
    });

    return {
      text: llmResponse.text,
    };
  }
);
