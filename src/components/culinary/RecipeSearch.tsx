'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, ChefHat, Loader2, AlertCircle, BookPlus, Calculator, ListChecks } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { searchMeals, type MealSearchOutput, type MealSchema } from '@/ai/flows/meal-db-flow';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Recipe } from '@/components/culinary/CulinaryApp';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useChecklist, type Checklist } from '@/contexts/ChecklistContext';

interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    cost: number;
}

const MealDetails = ({ meal }: { meal: MealSchema }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes:listV5', []);
    const { addList } = useChecklist();
    const [, setPrimaryIngredients] = useLocalStorage<Ingredient[]>('foodcost:primary', []);
    const [, setDishName] = useLocalStorage('foodcost:dishName', 'My New Dish');
    
    const { ingredients, ingredientNames } = React.useMemo(() => {
        const ingredientsList: string[] = [];
        const ingredientNamesList: {name: string, quantity: number, unit: string}[] = [];

        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}` as keyof MealSchema] as string;
            const measure = meal[`strMeasure${i}` as keyof MealSchema] as string;
            if (ingredient && ingredient.trim()) {
                ingredientsList.push(`${measure || ''} ${ingredient}`.trim());

                // Simple parsing of quantity and unit
                const measureParts = (measure || '').trim().split(' ');
                let quantity = 1;
                let unit = '';
                if(measureParts.length > 0) {
                    const firstPartNum = parseFloat(measureParts[0]);
                    if (!isNaN(firstPartNum)) {
                        quantity = firstPartNum;
                        unit = measureParts.slice(1).join(' ');
                    } else {
                        unit = measure.trim();
                    }
                }
                ingredientNamesList.push({ name: ingredient.trim(), quantity, unit });
            }
        }
        return { ingredients: ingredientsList, ingredientNames: ingredientNamesList };
    }, [meal]);
    
    const instructions = meal.strInstructions?.split('\n').filter(line => line.trim()) || [];

    const handleSaveToCookbook = () => {
        const newRecipe: Recipe = {
            id: uuidv4(),
            title: meal.strMeal,
            category: meal.strCategory || '',
            description: `A recipe for ${meal.strMeal} from TheMealDB.`,
            ingredients: ingredients.join('\n'),
            instructions: instructions.join('\n'),
            imageUrl: meal.strMealThumb || undefined,
            createdAt: new Date().toISOString(),
        };
        setRecipes(prev => [newRecipe, ...prev]);
        toast({
            title: "Recipe Saved!",
            description: `"${meal.strMeal}" has been added to your cookbook.`,
        });
    };
    
    const handleSendToFoodCost = () => {
        const foodCostIngredients: Ingredient[] = ingredientNames.map(ing => ({
            id: uuidv4(),
            name: `${ing.name} (${ing.unit})`,
            quantity: ing.quantity || 1,
            cost: 0,
        }));
        setDishName(meal.strMeal);
        setPrimaryIngredients(foodCostIngredients);
        toast({
            title: "Ingredients Sent!",
            description: "Navigating to Food Cost Calculator...",
        });
        router.push('/culinary/calculators/food-cost');
    };

    const handleSendToPrepChecklist = () => {
        const newChecklist: Checklist = {
            id: `recipe-prep-${uuidv4()}`,
            title: `${meal.strMeal} - Prep List`,
            tasks: ingredients.map(ing => ({
                id: uuidv4(),
                text: ing,
                completed: false,
                createdAt: Date.now(),
                priority: 'none',
                subtasks: [],
            }))
        };
        addList(newChecklist);
        toast({
            title: "Checklist Created!",
            description: "Navigating to Recipe Preparation Checklist...",
        });
        router.push('/culinary/workflow/checklist');
    };

    const isAlreadySaved = recipes.some(r => r.title.toLowerCase() === meal.strMeal.toLowerCase());

    return (
        <Card className="flex-1">
            <CardContent className="p-0">
                <ScrollArea className="h-[70vh]">
                    <div className="p-6">
                        {meal.strMealThumb && <div className="aspect-video relative mb-4"><Image src={meal.strMealThumb} alt={meal.strMeal} layout="fill" objectFit="cover" className="rounded-lg" unoptimized /></div>}
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-3xl">{meal.strMeal}</CardTitle>
                            <CardDescription>{meal.strCategory} | {meal.strArea}</CardDescription>
                        </CardHeader>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-2">
                                <h3 className="font-semibold text-lg border-b pb-1">Ingredients</h3>
                                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                    {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                </ul>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <h3 className="font-semibold text-lg border-b pb-1">Instructions</h3>
                                <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                                    {instructions.map((step, i) => <li key={i}>{step}</li>)}
                                </ol>
                            </div>
                        </div>

                         <div className="mt-6 flex flex-wrap gap-2">
                            <Button onClick={handleSaveToCookbook} disabled={isAlreadySaved}>
                                <BookPlus className="mr-2 h-4 w-4" />
                                {isAlreadySaved ? 'Saved to Cookbook' : 'Save to Cookbook'}
                            </Button>
                            <Button onClick={handleSendToFoodCost} variant="outline">
                                <Calculator className="mr-2 h-4 w-4" />
                                Send to Food Cost
                            </Button>
                             <Button onClick={handleSendToPrepChecklist} variant="outline">
                                <ListChecks className="mr-2 h-4 w-4" />
                                Send to Prep Checklist
                            </Button>
                            {meal.strSource && <Button asChild variant="secondary"><a href={meal.strSource} target="_blank" rel="noopener noreferrer">View Source</a></Button>}
                            {meal.strYoutube && <Button asChild variant="destructive"><a href={meal.strYoutube} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></Button>}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};


export function RecipeSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MealSearchOutput>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<MealSchema | null>(null);
    
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            setSelectedMeal(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSelectedMeal(null);
        try {
            const searchResult = await searchMeals({ query });
            if (searchResult) {
                setResults(searchResult);
                toast({ title: 'Search Complete', description: `Found ${searchResult.length} recipes.` });
            } else {
                setResults([]);
                toast({ title: 'No Results', description: 'No recipes found for your query.' });
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to fetch recipes. ${errorMessage}`);
            toast({ variant: 'destructive', title: 'Search Failed', description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full flex flex-col h-full gap-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search for recipes (e.g., 'Arrabiata')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <Search className="mr-2" />}
                    Search
                </Button>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
                <Card className="lg:col-span-1">
                    <CardContent className="p-2 h-full">
                        <ScrollArea className="h-full">
                            <div className="p-2 space-y-2">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin"/></div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
                                        <AlertCircle className="h-12 w-12 mb-4"/>
                                        <h3 className="font-semibold text-lg">An Error Occurred</h3>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                ) : results.length > 0 ? (
                                    results.map(meal => (
                                        <Card key={meal.idMeal} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMeal(meal)}>
                                            <CardHeader className="flex-row gap-4 items-center p-3">
                                                {meal.strMealThumb ? <div className="w-16 h-16 relative flex-shrink-0">
                                                    <Image src={meal.strMealThumb} alt={meal.strMeal} layout="fill" objectFit="cover" className="rounded-md" unoptimized/>
                                                </div> : <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center"><ChefHat className="h-8 w-8 text-muted-foreground"/></div>}
                                                <div>
                                                  <p className="font-semibold">{meal.strMeal}</p>
                                                  <p className="text-xs text-muted-foreground">{meal.strCategory} | {meal.strArea}</p>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                                        <ChefHat className="h-16 w-16 mb-4"/>
                                        <h3 className="font-semibold text-lg">Search for Recipes</h3>
                                        <p className="text-sm">Use the search bar above to find recipes from TheMealDB.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    {selectedMeal ? (
                        <MealDetails meal={selectedMeal} />
                    ) : (
                        <Card className="h-full flex items-center justify-center bg-muted/30 border-dashed">
                           <div className="text-center text-muted-foreground">
                               <p>Select a recipe to see the details.</p>
                           </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
