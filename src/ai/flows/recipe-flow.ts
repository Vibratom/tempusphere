'use server';
/**
 * @fileOverview A recipe-related AI agent that can search for recipes online.
 *
 * - searchRecipes - A function that handles the recipe search process.
 * - RecipeSearchInput - The input type for the searchRecipes function.
 * - RecipeSearchOutput - The return type for the searchRecipes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecipeSearchInputSchema = z.object({
  query: z.string().describe('The search query for recipes, like "Arrabiata" or "Chicken".'),
});
export type RecipeSearchInput = z.infer<typeof RecipeSearchInputSchema>;

const FoundRecipeSchema = z.object({
  id: z.string().describe("The unique ID of the recipe from the external API."),
  title: z.string().describe("The title of the recipe."),
  description: z.string().describe("A brief description of the recipe."),
  ingredients: z.string().describe("A newline-separated list of ingredients and their measurements."),
  instructions: z.string().describe("The step-by-step instructions for preparing the recipe."),
  imageUrl: z.string().optional().describe("A URL to an image of the recipe."),
});

const RecipeSearchOutputSchema = z.object({
  recipes: z.array(FoundRecipeSchema).describe("A list of recipes found from the online search."),
});
export type RecipeSearchOutput = z.infer<typeof RecipeSearchOutputSchema>;

// This tool is defined for the AI to call an external recipe API.
const searchMealDBTool = ai.defineTool(
    {
        name: 'searchMealDB',
        description: 'Searches TheMealDB for recipes based on a query.',
        inputSchema: z.object({ query: z.string() }),
        outputSchema: RecipeSearchOutputSchema,
    },
    async (input) => {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${input.query}`);
            if (!response.ok) {
                console.error("TheMealDB API request failed with status:", response.status);
                return { recipes: [] };
            }
            const data = await response.json();
            
            if (!data.meals) {
                return { recipes: [] };
            }

            const recipes = data.meals.map((meal: any) => {
                const ingredients: string[] = [];
                for (let i = 1; i <= 20; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];
                    if (ingredient && ingredient.trim()) {
                        ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`.trim());
                    }
                }

                return {
                    id: meal.idMeal,
                    title: meal.strMeal,
                    description: meal.strInstructions.substring(0, 150) + (meal.strInstructions.length > 150 ? '...' : ''),
                    ingredients: ingredients.join('\n'),
                    instructions: meal.strInstructions,
                    imageUrl: meal.strMealThumb,
                };
            });
            
            return { recipes };
        } catch (error) {
            console.error('Error fetching from TheMealDB:', error);
            // Return an empty list in case of any error.
            return { recipes: [] };
        }
    }
);

// This flow uses the tool to search for recipes.
const recipeSearchFlow = ai.defineFlow(
  {
    name: 'recipeSearchFlow',
    inputSchema: RecipeSearchInputSchema,
    outputSchema: RecipeSearchOutputSchema,
  },
  async (input) => {
    console.log(`Starting recipe search flow for query: "${input.query}"`);
    
    // We directly call our tool here. An LLM call isn't necessary as we just want to proxy the API.
    const searchResult = await searchMealDBTool(input);

    console.log(`Found ${searchResult.recipes.length} recipes.`);
    return searchResult;
  }
);

export async function searchRecipes(input: RecipeSearchInput): Promise<RecipeSearchOutput> {
  return recipeSearchFlow(input);
}
