'use server';
/**
 * @fileOverview An AI flow to generate Mermaid.js diagram code from a natural language description.
 *
 * - generateDiagram - A function that takes a text description and returns Mermaid.js code.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 * - GenerateDiagramOutput - The return type for the generateDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramInputSchema = z.object({
  description: z.string().describe('A natural language description of the diagram to be generated.'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  mermaidCode: z.string().describe('The generated Mermaid.js code for the diagram.'),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;


export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  return generateDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagramPrompt',
  input: {schema: GenerateDiagramInputSchema},
  output: {schema: GenerateDiagramOutputSchema},
  prompt: `You are an expert in creating diagrams using Mermaid.js syntax. Based on the user's request, generate the corresponding Mermaid.js code that accurately represents their description.

  IMPORTANT: ONLY output the Mermaid.js code itself. Do NOT wrap it in a markdown code block (i.e., do not include \`\`\`mermaid or \`\`\`). Do not include any other text, titles, or explanations.
  
  User Request: {{{description}}}`,
});

const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: GenerateDiagramInputSchema,
    outputSchema: GenerateDiagramOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate diagram. The AI model did not return a valid output.');
    }
    // Clean up potential markdown fences that the model might still add
    const cleanedCode = output.mermaidCode.replace(/^```mermaid\n/, '').replace(/\n```$/, '').trim();
    return { mermaidCode: cleanedCode };
  }
);
