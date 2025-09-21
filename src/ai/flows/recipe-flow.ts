
/**
 * @fileOverview A function for searching food products using the Open Food Facts API.
 */

import { z } from 'zod';

export const RecipeSearchInputSchema = z.object({
  query: z.string().describe('The search query for food products.'),
});
export type RecipeSearchInput = z.infer<typeof RecipeSearchInputSchema>;

export const RecipeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    thumbnail_url: z.string().optional().nullable(),
});

export const RecipeSearchOutputSchema = z.array(RecipeSchema);
export type RecipeSearchOutput = z.infer<typeof RecipeSearchOutputSchema>;

export async function searchRecipes(
  input: RecipeSearchInput
): Promise<RecipeSearchOutput> {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(input.query)}&search_simple=1&action=process&json=1&page_size=20`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Open Food Facts API Error:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        
        if (result && Array.isArray(result.products)) {
            return result.products.map((product: any) => ({
                id: product.id,
                name: product.product_name || 'Unknown Product',
                description: product.generic_name_en || product.ingredients_text,
                thumbnail_url: product.image_url,
            }));
        } else {
            console.error('Unexpected API response structure:', result);
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch from Open Food Facts API:', error);
        throw new Error('Failed to fetch products from the Open Food Facts API.');
    }
}
