
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, Beef, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface FoodNutrient {
    nutrientName: string;
    unitName: string;
    value: number;
}

interface FoodResult {
    fdcId: number;
    description: string;
    foodNutrients: FoodNutrient[];
    brandOwner?: string;
    ingredients?: string;
}

export function NutritionExplorer() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodResult | null>(null);
    const { usdaApiKey } = useSettings();
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!query.trim()) return;
        if (!usdaApiKey) {
            toast({
                variant: 'destructive',
                title: 'API Key Required',
                description: 'Please add your USDA FoodData Central API key in the Appearance settings tab.',
            });
            return;
        }

        setIsLoading(true);
        setResults([]);
        setSelectedFood(null);

        try {
            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(query)}&pageSize=25`);
            if (!response.ok) throw new Error('Failed to fetch data from USDA API');
            
            const data = await response.json();
            setResults(data.foods || []);

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Search Failed',
                description: 'Could not fetch nutritional data. Please check your API key and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const mainNutrients = [
        "Energy", "Protein", "Total lipid (fat)", "Carbohydrate, by difference", "Sugars, total including NLEA",
        "Fiber, total dietary", "Sodium, Na", "Cholesterol"
    ];

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
                <Beef className="w-16 h-16 mb-4 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Nutrition Explorer</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    Look up detailed nutritional information for any food item using the USDA FoodData Central database.
                </p>
            </div>
            
            <div className="flex gap-2">
                <Input 
                    placeholder="Search for a food, e.g., 'raw apple' or 'cheddar cheese'..." 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                    Search
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
                <Card className="md:col-span-1 flex flex-col">
                    <CardHeader><CardTitle>Search Results</CardTitle></CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-full">
                            <div className="p-4 pt-0 space-y-2">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full pt-16"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                                ) : results.length > 0 ? (
                                    results.map(food => (
                                        <div key={food.fdcId} onClick={() => setSelectedFood(food)} className="p-3 rounded-md border bg-background hover:bg-muted cursor-pointer">
                                            <p className="font-semibold">{food.description}</p>
                                            {food.brandOwner && <p className="text-xs text-muted-foreground">{food.brandOwner}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground pt-16">
                                        <p>No results. Try another search.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Nutritional Information</CardTitle>
                        <CardDescription>Details for the selected food item (per 100g serving).</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-full">
                           <div className="p-4 pt-0">
                             {selectedFood ? (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold">{selectedFood.description}</h3>
                                    {selectedFood.brandOwner && <p className="text-sm text-muted-foreground">Brand: {selectedFood.brandOwner}</p>}
                                    {selectedFood.ingredients && <p className="text-xs italic text-muted-foreground">Ingredients: {selectedFood.ingredients}</p>}

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nutrient</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedFood.foodNutrients
                                                .filter(n => mainNutrients.includes(n.nutrientName))
                                                .sort((a,b) => mainNutrients.indexOf(a.nutrientName) - mainNutrients.indexOf(b.nutrientName))
                                                .map(nutrient => (
                                                <TableRow key={nutrient.nutrientName}>
                                                    <TableCell className="font-medium">{nutrient.nutrientName}</TableCell>
                                                    <TableCell className="text-right">{nutrient.value} {nutrient.unitName.toLowerCase()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                                    <p>Select a food from the search results to see its details.</p>
                                </div>
                            )}
                           </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

