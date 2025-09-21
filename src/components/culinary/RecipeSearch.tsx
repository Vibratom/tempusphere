
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, ChefHat, Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { searchRecipes, type RecipeSearchOutput } from '@/ai/flows/recipe-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

// This is a simplified detail view for the search results
const RecipeDetailDialog = ({ recipe, onOpenChange }: { recipe: any, onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{recipe.name}</DialogTitle>
                    <DialogDescription>{recipe.description}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="pr-4 space-y-4">
                        {recipe.thumbnail_url && <Image src={recipe.thumbnail_url} alt={recipe.name} width={400} height={300} className="rounded-md mx-auto" />}
                        
                        <div>
                            <h3 className="font-semibold mb-2">Ingredients</h3>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {recipe.sections?.flatMap((s: any) => s.components.map((c: any) => (
                                    <li key={c.id}>{c.raw_text}</li>
                                )))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Instructions</h3>
                            <ol className="list-decimal pl-5 space-y-2 text-sm">
                                {recipe.instructions?.map((i: any) => (
                                    <li key={i.id}>{i.display_text}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    {recipe.original_video_url && <Button asChild variant="secondary"><a href={recipe.original_video_url} target="_blank" rel="noopener noreferrer">Watch Video</a></Button>}
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function RecipeSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RecipeSearchOutput>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
    
    const { toast } = useToast();
    const { tastyApiKey } = useSettings();

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        if (!tastyApiKey) {
            setError('Tasty API key is not set. Please add it in the settings panel under "Appearance".');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const searchResult = await searchRecipes({ query, apiKey: tastyApiKey });
            setResults(searchResult);
            toast({ title: 'Search Complete', description: `Found ${searchResult.length} recipes.` });
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to fetch recipes. ${errorMessage}`);
            toast({ variant: 'destructive', title: 'Search Failed', description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleViewRecipe = async (recipeId: number) => {
        if (!tastyApiKey) {
            setError('Tasty API key is not set.');
            return;
        }
        
        // This is a simplified detail fetch. A real implementation might use another Genkit flow.
        const url = `https://tasty.p.rapidapi.com/recipes/get-more-info?recipe_id=${recipeId}`;
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': tastyApiKey,
            'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
          }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Failed to fetch recipe details.');
            const data = await response.json();
            setSelectedRecipe(data);
        } catch(e) {
            toast({variant: 'destructive', title: 'Error', description: 'Could not fetch recipe details.'});
        }
    }

    return (
        <div className="w-full flex flex-col h-full gap-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search for recipes..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <Search className="mr-2" />}
                    Search
                </Button>
            </div>
            <Card className="flex-1">
                <CardContent className="p-4 h-full">
                    <ScrollArea className="h-full">
                         <div className="pr-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin"/></div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-destructive">
                                    <AlertCircle className="h-16 w-16 mb-4"/>
                                    <h3 className="font-semibold text-lg">An Error Occurred</h3>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.map(recipe => (
                                        <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewRecipe(recipe.id)}>
                                            <CardHeader className="p-0">
                                                {recipe.thumbnail_url && <div className="aspect-video relative">
                                                    <Image src={recipe.thumbnail_url} alt={recipe.name} layout="fill" objectFit="cover" className="rounded-t-lg" unoptimized/>
                                                </div>}
                                            </CardHeader>
                                            <CardContent className="p-3">
                                                <p className="font-semibold truncate">{recipe.name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description || 'No description available.'}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                    <ChefHat className="h-16 w-16 mb-4"/>
                                    <h3 className="font-semibold text-lg">Search for Recipes</h3>
                                    <p className="text-sm">Use the search bar above to find new recipes from the Tasty API.</p>
                                </div>
                            )}
                         </div>
                    </ScrollArea>
                </CardContent>
            </Card>
            {selectedRecipe && <RecipeDetailDialog recipe={selectedRecipe} onOpenChange={() => setSelectedRecipe(null)} />}
        </div>
    );
}
