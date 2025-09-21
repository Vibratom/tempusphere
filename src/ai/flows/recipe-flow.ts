
'use server';
/**
 * @fileOverview A Genkit flow for searching recipes using the Tasty API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const RecipeSearchInputSchema = z.object({
  query: z.string().describe('The search query for recipes.'),
  apiKey: z.string().describe('The API key for the Tasty API.'),
});
export type RecipeSearchInput = z.infer<typeof RecipeSearchInputSchema>;

export const RecipeSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional().nullable(),
    thumbnail_url: z.string().optional().nullable(),
    total_time_minutes: z.number().optional().nullable(),
    yields: z.string().optional().nullable(),
});

export const RecipeSearchOutputSchema = z.array(RecipeSchema);
export type RecipeSearchOutput = z.infer<typeof RecipeSearchOutputSchema>;

export async function searchRecipes(
  input: RecipeSearchInput
): Promise<RecipeSearchOutput> {
  return await searchRecipesFlow(input);
}

const searchRecipesFlow = ai.defineFlow(
  {
    name: 'searchRecipesFlow',
    inputSchema: RecipeSearchInputSchema,
    outputSchema: RecipeSearchOutputSchema,
  },
  async (input) => {
    const url = `https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&q=${encodeURIComponent(input.query)}`;
    
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': input.apiKey,
        'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
      }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Tasty API Error:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        
        // Assuming the API returns an object with a 'results' array
        if (result && Array.isArray(result.results)) {
            return result.results.map((recipe: any) => ({
                id: recipe.id,
                name: recipe.name || 'Untitled Recipe',
                description: recipe.description,
                thumbnail_url: recipe.thumbnail_url,
                total_time_minutes: recipe.total_time_minutes,
                yields: recipe.yields,
            }));
        } else {
            console.error('Unexpected API response structure:', result);
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch from Tasty API:', error);
        throw new Error('Failed to fetch recipes from the Tasty API.');
    }
  }
);
