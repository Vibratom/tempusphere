'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Timer, Users, ChefHat, Link as LinkIcon, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

interface RecipeSearchResult {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
}

interface RecipeDetails extends RecipeSearchResult {
    sourceUrl: string;
    extendedIngredients: { original: string }[];
    analyzedInstructions: { steps: { number: number; step: string }[] }[];
}

export function RecipeSearch() {
    const { spoonacularApiKey } = useSettings();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RecipeSearchResult[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!spoonacularApiKey) {
            toast({
                title: 'API Key Missing',
                description: 'Please add your Spoonacular API key in the Appearance settings tab to use this feature.',
                variant: 'destructive',
            });
        }
    }, [spoonacularApiKey, toast]);

    const handleSearch = async () => {
        if (!spoonacularApiKey) {
            toast({ variant: 'destructive', title: 'API Key is required.' });
            return;
        }
        if (!query.trim()) return;

        setIsLoading(true);
        setResults([]);

        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${spoonacularApiKey}&number=20`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch recipes.');
            }
            const data = await response.json();
            setResults(data.results);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Search Failed', description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewRecipe = async (recipeId: number) => {
        if (!spoonacularApiKey) {
            toast({ variant: 'destructive', title: 'API Key is required.' });
            return;
        }
        setIsDetailsLoading(true);
        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${spoonacularApiKey}`);
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch recipe details.');
            }
            const data = await response.json();
            setSelectedRecipe(data);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Failed to load details', description: (error as Error).message });
        } finally {
            setIsDetailsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col h-full gap-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search for recipes (e.g., 'vegan pasta')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={!spoonacularApiKey}
                />
                <Button onClick={handleSearch} disabled={isLoading || !spoonacularApiKey}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Search className="mr-2" />}
                    Search
                </Button>
            </div>
            <Card className="flex-1">
                <CardContent className="p-4 h-full">
                    <ScrollArea className="h-full">
                         <div className="pr-4">
                            {results.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.map(recipe => (
                                        <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewRecipe(recipe.id)}>
                                            <CardHeader className="p-0">
                                                <div className="aspect-video relative">
                                                    <Image src={recipe.image} alt={recipe.title} layout="fill" objectFit="cover" className="rounded-t-lg" unoptimized/>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-3">
                                                <p className="font-semibold truncate">{recipe.title}</p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                                    <span className="flex items-center gap-1"><Timer className="h-3 w-3"/>{recipe.readyInMinutes} min</span>
                                                    <span className="flex items-center gap-1"><Users className="h-3 w-3"/>Serves {recipe.servings}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                    <ChefHat className="h-16 w-16 mb-4"/>
                                    <h3 className="font-semibold text-lg">Discover New Recipes</h3>
                                    <p className="text-sm">Use the search bar above to find your next favorite dish.</p>
                                    {!spoonacularApiKey && <p className="text-destructive text-sm mt-2">Please add your Spoonacular API key in settings.</p>}
                                </div>
                            )}
                         </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
                <DialogContent className="max-w-3xl">
                     {isDetailsLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10"/></div>
                    ) : selectedRecipe && (
                        <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                            <DialogDescription className="flex items-center justify-center gap-6 pt-2">
                                 <span className="flex items-center gap-1"><Timer className="h-4 w-4"/>{selectedRecipe.readyInMinutes} min</span>
                                <span className="flex items-center gap-1"><Users className="h-4 w-4"/>Serves {selectedRecipe.servings}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] -mx-4">
                            <div className="px-6 grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg">Ingredients</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                        {selectedRecipe.extendedIngredients.map((ing, i) => <li key={i}>{ing.original}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                     <h4 className="font-semibold text-lg">Instructions</h4>
                                     <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        {selectedRecipe.analyzedInstructions[0]?.steps.map(step => <li key={step.number}>{step.step}</li>)}
                                     </ol>
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <Button variant="outline" asChild>
                                <a href={selectedRecipe.sourceUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2"/>View Original</a>
                            </Button>
                        </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
