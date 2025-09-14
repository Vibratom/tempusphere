
'use server';
/**
 * @fileOverview A flow for generating a checklist based on a user's goal.
 *
 * - generateChecklist - A function that takes a goal and returns a list of tasks.
 * - GenerateChecklistOutput - The return type for the generateChecklist function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// We only need an output schema, as the input is a simple string.
export const GenerateChecklistOutputSchema = z.object({
  tasks: z.array(z.string().describe('A single, actionable task for the checklist.')),
});
export type GenerateChecklistOutput = z.infer<typeof GenerateChecklistOutputSchema>;

export async function generateChecklist(goal: string): Promise<GenerateChecklistOutput> {
  return generateChecklistFlow(goal);
}

const checklistPrompt = ai.definePrompt({
  name: 'checklistPrompt',
  input: { schema: z.string() },
  output: { schema: GenerateChecklistOutputSchema },
  prompt: `You are a helpful assistant that specializes in breaking down goals into actionable checklists.
  
A user will provide a goal, and you should generate a list of tasks to help them achieve it.
The tasks should be concise, clear, and actionable. Generate between 5 and 15 tasks.

Goal: {{{input}}}
`,
});

const generateChecklistFlow = ai.defineFlow(
  {
    name: 'generateChecklistFlow',
    inputSchema: z.string(),
    outputSchema: GenerateChecklistOutputSchema,
  },
  async (goal) => {
    const { output } = await checklistPrompt(goal);
    return output!;
  }
);
