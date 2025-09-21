
import { z } from 'zod';

export const MealSearchInputSchema = z.object({
  query: z.string().describe('The search query for meals.'),
});
export type MealSearchInput = z.infer<typeof MealSearchInputSchema>;

export const MealSchema = z.object({
    idMeal: z.string(),
    strMeal: z.string(),
    strCategory: z.string().optional().nullable(),
    strArea: z.string().optional().nullable(),
    strMealThumb: z.string().optional().nullable(),
    strInstructions: z.string().optional().nullable(),
    strSource: z.string().optional().nullable(),
    strYoutube: z.string().optional().nullable(),
});

export const MealSearchOutputSchema = z.array(MealSchema);
export type MealSearchOutput = z.infer<typeof MealSearchOutputSchema>;

export async function searchMeals(
  input: MealSearchInput
): Promise<MealSearchOutput> {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(input.query)}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('TheMealDB API Error:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        
        if (result && Array.isArray(result.meals)) {
            return result.meals;
        } else {
            console.log('No meals found or unexpected API response structure:', result);
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch from TheMealDB API:', error);
        throw new Error('Failed to fetch meals from TheMealDB API.');
    }
}
