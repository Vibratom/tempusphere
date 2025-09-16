
'use server';
/**
 * @fileOverview A Genkit flow for generating Mermaid.js diagrams from a text prompt.
 *
 * - generateDiagram - A function that takes a user's prompt and returns Mermaid.js code.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDiagramInputSchema = z.object({
  prompt: z.string().describe('A natural language description of the diagram to be generated.'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

// Define the main function that will be called from the UI
export async function generateDiagram(input: GenerateDiagramInput): Promise<string> {
  return generateDiagramFlow(input);
}

const diagrammingPrompt = ai.definePrompt({
    name: 'diagrammingPrompt',
    input: { schema: GenerateDiagramInputSchema },
    output: { format: 'text' },
    prompt: `You are an expert in Mermaid.js syntax. A user will provide a description of a process, system, or idea. Your task is to generate the corresponding Mermaid.js code for that diagram.

    IMPORTANT RULES:
    1.  Your output MUST be ONLY the Mermaid.js code block. Do not include any explanations, apologies, or markdown formatting like \`\`\`mermaid or \`\`\`.
    2.  For flowcharts, use rounded nodes by default, for example: \`A(Node Text)\` instead of \`A[Node Text]\`.
    3.  Analyze the user's prompt to choose the most appropriate diagram type (e.g., flowchart, sequenceDiagram, mindmap, etc.). Default to a 'flowchart TD' if unsure.
    4.  Keep the generated diagram clear, concise, and easy to read.

    User Prompt:
    {{{prompt}}}
    `,
});

// Define the flow that orchestrates the AI call
const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: GenerateDiagramInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await diagrammingPrompt(input);
    return output!;
  }
);
