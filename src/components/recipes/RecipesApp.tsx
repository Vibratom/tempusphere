
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';
import { UtensilsCrossed, Plus, BookOpen, Trash2, Edit, GitBranch, ArrowLeft, Search, Sparkles, ChefHat } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { starterRecipes, type StarterRecipe } from '@/lib/starter-recipes';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
  createdAt: string;
  remixedFrom?: string; // ID of the parent recipe
}

const RecipeForm = ({ onSave, recipe, onCancel }: { onSave: (recipe: Recipe) => void, recipe?: Recipe | null, onCancel: () => void }) => {
    const [title, setTitle] = useState(recipe?.title || '');
    const [description, setDescription] = useState(recipe?.description || '');
    const [ingredients, setIngredients] = useState(recipe?.ingredients || '');
    const [instructions, setInstructions] = useState(recipe?.instructions || '');

    useEffect(() => {
        if (recipe) {
            setTitle(recipe.title);
            setDescription(recipe.description);
            setIngredients(recipe.ingredients);
            setInstructions(recipe.instructions);
        }
    }, [recipe]);

    const handleSave = () => {
        if (!title.trim()) return;
        const newRecipe: Recipe = {
            id: recipe?.id || uuidv4(),
            title,
            description,
            ingredients,
            instructions,
            createdAt: recipe?.createdAt || new Date().toISOString(),
            remixedFrom: recipe?.remixedFrom
        };
        onSave(newRecipe);
    };

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{recipe?.id ? 'Edit Recipe' : 'Add a New Recipe'}</DialogTitle>
                <DialogDescription>
                    {recipe?.remixedFrom ? 'You are editing a remix. Your changes will be saved to this version.' : 'Add the details of your recipe below. You can always "remix" it later to create new versions.'}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Recipe Title</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Grandma's Famous Cookies" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description / Story</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A short description or the story behind this recipe." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="ingredients">Ingredients</Label>
                        <Textarea id="ingredients" value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="1 cup flour..." rows={10} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="1. Preheat oven to 350°F..." rows={10} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <DialogClose asChild>
                    <Button onClick={handleSave}>Save Recipe</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export function RecipesApp() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes:listV1', []);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveRecipe = (recipe: Recipe) => {
    const existingIndex = recipes.findIndex(r => r.id === recipe.id);
    if (existingIndex > -1) {
        const newRecipes = [...recipes];
        newRecipes[existingIndex] = recipe;
        setRecipes(newRecipes);
    } else {
        setRecipes([...recipes, recipe]);
    }
    setEditingRecipe(undefined);
  }
  
  const addStarterToCookbook = (starter: StarterRecipe) => {
    const newRecipe: Recipe = {
        ...starter,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
    };
    setRecipes(prev => [...prev, newRecipe]);
  }

  const handleRemixRecipe = (originalRecipe: Recipe) => {
    const remixedRecipe: Recipe = {
      ...originalRecipe,
      id: uuidv4(), // New ID for the remixed version
      title: `${originalRecipe.title} (Remix)`,
      createdAt: new Date().toISOString(),
      remixedFrom: originalRecipe.id, // Link back to the original
    };
    // Open the form with the new remixed recipe, but it's not saved yet
    setEditingRecipe(remixedRecipe);
  }

  if (!isClient) {
      return (
         <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <UtensilsCrossed className="w-16 h-16 mb-4 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Recipe Remix</h1>
                <p className="text-lg text-muted-foreground mt-2">Your personal culinary journal.</p>
            </div>
        </div>
      )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <UtensilsCrossed className="w-16 h-16 mb-4 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Recipe Remix</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Your personal culinary journal. Create base recipes, "remix" them to track variations, or get inspired by our starter cookbook.</p>
      </div>

      <Dialog open={editingRecipe !== undefined} onOpenChange={(isOpen) => !isOpen && setEditingRecipe(undefined)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ChefHat className="text-accent" />Starter Cookbook</CardTitle>
                    <CardDescription>New to cooking? Browse these simple recipes and add them to your collection to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ScrollArea className="h-96">
                        <div className="space-y-4 pr-4">
                            {starterRecipes.map(recipe => (
                                <Card key={recipe.title} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                        <CardDescription>{recipe.description}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="mt-auto flex justify-end gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => addStarterToCookbook(recipe)}><Plus className="mr-2 h-4 w-4"/>Add to My Cookbook</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Cookbook</CardTitle>
                    <Button onClick={() => setEditingRecipe(null)}><Plus className="mr-2"/>Add New Recipe</Button>
                </CardHeader>
                <CardContent>
                    {recipes.length > 0 ? (
                        <ScrollArea className="h-96">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                                {recipes.map(recipe => (
                                    <Card key={recipe.id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                            <CardDescription>{recipe.description.substring(0, 100)}{recipe.description.length > 100 ? '...' : ''}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className="mt-auto flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingRecipe(recipe)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleRemixRecipe(recipe)}><GitBranch className="mr-2 h-4 w-4"/>Remix</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                            <BookOpen className="w-16 h-16 mb-4" />
                            <h3 className="text-xl font-semibold">Your Cookbook is Empty</h3>
                            <p className="text-sm">Add a new recipe or choose one from the starters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        {editingRecipe !== undefined && <RecipeForm onSave={handleSaveRecipe} recipe={editingRecipe} onCancel={() => setEditingRecipe(undefined)}/>}
      </Dialog>
    </div>
  );
}
