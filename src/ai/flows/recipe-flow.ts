
'use server';
/**
 * @fileOverview An AI flow for generating recipes.
 *
 * - generateRecipeFromIngredients - A function that generates a recipe based on a list of ingredients.
 * - RecipeOutput - The return type for the recipe generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const RecipeOutputSchema = z.object({
  title: z.string().describe('A creative and fitting title for the recipe.'),
  description: z.string().describe('A short, engaging description or story about the recipe, max 2-3 sentences.'),
  ingredients: z.string().describe('A list of ingredients, formatted with each ingredient on a new line.'),
  instructions: z.string().describe('The step-by-step instructions for preparing the recipe, with each step numbered and on a new line.'),
});
export type RecipeOutput = z.infer<typeof RecipeOutputSchema>;

const recipePrompt = ai.definePrompt({
    name: 'recipeGeneratorPrompt',
    input: { schema: z.string() },
    output: { schema: RecipeOutputSchema },
    prompt: `You are a creative chef who specializes in making simple, beginner-friendly recipes from a limited set of ingredients.
    A user will provide you with a list of ingredients they have in their kitchen.
    Your task is to generate a delicious and easy-to-follow recipe that primarily uses these ingredients.

    You can assume the user has basic pantry staples like salt, pepper, oil, and water. If the recipe would be significantly improved by one or two other common ingredients (like an onion, garlic, or a simple spice), you can include them, but clearly mark them as "optional" or "recommended".

    The user has these ingredients:
    {{{input}}}

    Generate a complete recipe. The tone should be encouraging and simple.
    `
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: z.string(),
    outputSchema: RecipeOutputSchema,
  },
  async (ingredients) => {
    const { output } = await recipePrompt(ingredients);
    if (!output) {
      throw new Error('Failed to generate recipe from the model.');
    }
    return output;
  }
);

export async function generateRecipeFromIngredients(ingredients: string): Promise<RecipeOutput> {
  return generateRecipeFlow(ingredients);
}
