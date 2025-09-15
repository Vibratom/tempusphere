
'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';
import { UtensilsCrossed, Plus, BookOpen, Trash2, Edit, GitBranch, ArrowLeft, Search, Sparkles, ChefHat, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { starterRecipes, type StarterRecipe } from '@/lib/starter-recipes';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { useChecklist } from '@/contexts/ChecklistContext';
import { useToast } from '@/hooks/use-toast';

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
    const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || '');

    useEffect(() => {
        if (recipe) {
            setTitle(recipe.title);
            setDescription(recipe.description);
            setIngredients(recipe.ingredients);
            setInstructions(recipe.instructions);
            setImageUrl(recipe.imageUrl || '');
        } else {
            setTitle('');
            setDescription('');
            setIngredients('');
            setInstructions('');
            setImageUrl('');
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
            imageUrl,
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
                 <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
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

const RecipeDetailView = ({ recipe, onBack, onViewRecipe, onEdit, onRemix, onDelete }: { recipe: Recipe, onBack: () => void, onViewRecipe: (recipe: Recipe) => void, onEdit: (recipe: Recipe) => void, onRemix: (recipe: Recipe) => void, onDelete: (id: string) => void }) => {
    const { recipes } = useRecipesContext();
    const { addList, addTask, lists } = useChecklist();
    const { toast } = useToast();

    const parentRecipe = recipe.remixedFrom ? recipes.find(r => r.id === recipe.remixedFrom) : null;
    const childRecipes = recipes.filter(r => r.remixedFrom === recipe.id);
    
    const handleAddToList = () => {
        let shoppingList = lists.find(list => list.title.toLowerCase() === 'shopping list');
        let listId: string;

        if (shoppingList) {
            listId = shoppingList.id;
        } else {
            const newList = {
                id: Date.now().toString(),
                title: 'Shopping List',
                tasks: [],
                color: 'hsl(var(--border))'
            };
            addList(newList);
            listId = newList.id;
        }

        const ingredientsToAdd = recipe.ingredients
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        ingredientsToAdd.forEach(ingredientText => {
            addTask(listId, {
                text: ingredientText,
                dueDate: undefined,
                isRecurring: false
            });
        });

        toast({
            title: "Ingredients Added!",
            description: `Added ${ingredientsToAdd.length} items to your "Shopping List".`
        })
    };
    
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Cookbook</Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleAddToList}><ShoppingBag className="mr-2 h-4 w-4"/>Add to List</Button>
                        <Button variant="outline" onClick={() => onEdit(recipe)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                        <Button onClick={() => onRemix(recipe)}><GitBranch className="mr-2 h-4 w-4"/>Remix</Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the "{recipe.title}" recipe. Any remixes of this recipe will be orphaned.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(recipe.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                 <Separator className="my-4" />
                <CardTitle className="text-3xl font-bold">{recipe.title}</CardTitle>
                {recipe.description && <CardDescription className="text-lg pt-2">{recipe.description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden relative">
                         {recipe.imageUrl ? (
                            <Image src={recipe.imageUrl} alt={recipe.title} layout="fill" objectFit="cover" unoptimized />
                        ) : (
                            <UtensilsCrossed className="w-12 h-12" />
                        )}
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">Ingredients</h3>
                        <p className="whitespace-pre-wrap text-muted-foreground">{recipe.ingredients}</p>
                    </div>
                </div>
               
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold border-b pb-2">Instructions</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed">{recipe.instructions}</p>
                    </div>
                </div>
            </CardContent>
            {(parentRecipe || childRecipes.length > 0) && (
                <CardFooter className="flex-col items-start gap-4">
                    <Separator />
                    <h3 className="text-xl font-semibold">Recipe Lineage</h3>
                    {parentRecipe && (
                        <div className="space-y-2">
                            <h4 className="font-medium">Remixed From</h4>
                            <Card className="w-full">
                                <CardHeader className="flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{parentRecipe.title}</CardTitle>
                                        <CardDescription>{parentRecipe.description.substring(0, 100)}...</CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => onViewRecipe(parentRecipe)}><BookOpen className="mr-2 h-4 w-4"/>View</Button>
                                </CardHeader>
                            </Card>
                        </div>
                    )}
                    {childRecipes.length > 0 && (
                         <div className="w-full space-y-2">
                            <h4 className="font-medium">Remixed Into</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                            {childRecipes.map(child => (
                                <Card key={child.id}>
                                    <CardHeader className="flex-row items-center justify-between">
                                         <div>
                                            <CardTitle className="text-lg">{child.title}</CardTitle>
                                            <CardDescription>{child.description.substring(0, 100)}...</CardDescription>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => onViewRecipe(child)}><BookOpen className="mr-2 h-4 w-4"/>View</Button>
                                    </CardHeader>
                                </Card>
                            ))}
                            </div>
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
};

const RecipesContext = React.createContext<{recipes: Recipe[], setRecipes: (recipes: Recipe[]) => void} | undefined>(undefined);

const useRecipesContext = () => {
    const context = React.useContext(RecipesContext);
    if (!context) {
        throw new Error("useRecipesContext must be used within a RecipesProvider");
    }
    return context;
};

export function RecipesApp() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes:listV3', []);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null | undefined>(undefined);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showStarterCookbook, setShowStarterCookbook] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    setRecipes(prev => [...prev, remixedRecipe]);
    setViewingRecipe(remixedRecipe);
  }

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(r => r.id !== recipeId));
    setViewingRecipe(null); // Go back to the main list
  }
  
  const filteredRecipes = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


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
  
  if(viewingRecipe) {
      return (
        <RecipesContext.Provider value={{ recipes, setRecipes }}>
          <div className="w-full max-w-5xl mx-auto">
              <RecipeDetailView 
                  recipe={viewingRecipe}
                  onBack={() => setViewingRecipe(null)}
                  onViewRecipe={setViewingRecipe}
                  onEdit={(recipe) => {
                      setEditingRecipe(recipe);
                  }}
                  onRemix={handleRemixRecipe}
                  onDelete={handleDeleteRecipe}
              />
               {editingRecipe !== undefined && <RecipeForm onSave={handleSaveRecipe} recipe={editingRecipe} onCancel={() => setEditingRecipe(undefined)}/>}
          </div>
        </RecipesContext.Provider>
      )
  }

  return (
    <RecipesContext.Provider value={{ recipes, setRecipes }}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <UtensilsCrossed className="w-16 h-16 mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Recipe Remix</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Your personal culinary journal. Create base recipes, "remix" them to track variations, or get inspired by our starter cookbook.</p>
          </div>
            
          <Dialog open={showStarterCookbook} onOpenChange={setShowStarterCookbook}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><ChefHat className="text-accent" />Starter Cookbook</DialogTitle>
                <DialogDescription>New to cooking? Browse these simple recipes and add them to your collection to get started.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh] -mx-6">
                <div className="space-y-4 px-6">
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
            </DialogContent>
          </Dialog>

          <Card>
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>My Cookbook</CardTitle>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="Search recipes..." 
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                  <Button variant="outline" onClick={() => setShowStarterCookbook(true)}><ChefHat className="mr-2"/>Get Inspired</Button>
                  <Button onClick={() => setEditingRecipe(null)}><Plus className="mr-2"/>Add New Recipe</Button>
                </div>
              </CardHeader>
              <CardContent>
                  {filteredRecipes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredRecipes.map(recipe => (
                              <Card key={recipe.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                  <CardHeader>
                                      {recipe.imageUrl && (
                                        <div className="aspect-video relative w-full overflow-hidden rounded-md mb-4">
                                            <Image src={recipe.imageUrl} alt={recipe.title} layout="fill" objectFit="cover" unoptimized/>
                                        </div>
                                      )}
                                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                      <CardDescription>{recipe.description.substring(0, 100)}{recipe.description.length > 100 ? '...' : ''}</CardDescription>
                                  </CardHeader>
                                  <CardFooter className="mt-auto flex justify-end gap-2">
                                      <Button variant="secondary" size="sm" onClick={() => setViewingRecipe(recipe)}><BookOpen className="mr-2 h-4 w-4"/>View</Button>
                                  </CardFooter>
                              </Card>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                          <BookOpen className="w-16 h-16 mb-4" />
                          <h3 className="text-xl font-semibold">{recipes.length > 0 ? 'No Recipes Found' : 'Your Cookbook is Empty'}</h3>
                          <p className="text-sm">{recipes.length > 0 ? 'Try a different search term.' : 'Add a new recipe or choose one from the starters.'}</p>
                      </div>
                  )}
              </CardContent>
          </Card>
          
          <Dialog open={editingRecipe !== undefined} onOpenChange={(isOpen) => !isOpen && setEditingRecipe(undefined)}>
            {editingRecipe !== undefined && <RecipeForm onSave={handleSaveRecipe} recipe={editingRecipe} onCancel={() => setEditingRecipe(undefined)}/>}
          </Dialog>
        </div>
    </RecipesContext.Provider>
  );
}
