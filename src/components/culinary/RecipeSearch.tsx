'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, ChefHat } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  title: string;
  category?: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
  createdAt: string;
  remixedFrom?: string;
  checklistId?: string;
  serves?: string;
  prepTime?: string;
  cookTime?: string;
  notes?: string;
}

export function RecipeSearch() {
    const [recipes] = useLocalStorage<Recipe[]>('recipes:listV5', []);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Recipe[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const { toast } = useToast();

    const handleSearch = () => {
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const lowercasedQuery = query.toLowerCase();
        const filteredRecipes = recipes.filter(recipe => 
            recipe.title.toLowerCase().includes(lowercasedQuery) ||
            recipe.description.toLowerCase().includes(lowercasedQuery) ||
            recipe.ingredients.toLowerCase().includes(lowercasedQuery) ||
            recipe.category?.toLowerCase().includes(lowercasedQuery)
        );
        
        setResults(filteredRecipes);
        setHasSearched(true);
        toast({ title: "Search Complete", description: `Found ${filteredRecipes.length} recipes.`})
    };
    
    return (
        <div className="w-full flex flex-col h-full gap-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search your cookbook..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                    <Search className="mr-2" />
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
                                        <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                                            <CardHeader className="p-0">
                                                {recipe.imageUrl && <div className="aspect-video relative">
                                                    <Image src={recipe.imageUrl} alt={recipe.title} layout="fill" objectFit="cover" className="rounded-t-lg" unoptimized/>
                                                </div>}
                                            </CardHeader>
                                            <CardContent className="p-3">
                                                <p className="font-semibold truncate">{recipe.title}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                    <ChefHat className="h-16 w-16 mb-4"/>
                                    <h3 className="font-semibold text-lg">{hasSearched ? "No Recipes Found" : "Search Your Cookbook"}</h3>
                                    <p className="text-sm">{hasSearched ? `No recipes matched your search for "${query}".` : "Use the search bar above to find recipes you've saved."}</p>
                                </div>
                            )}
                         </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
