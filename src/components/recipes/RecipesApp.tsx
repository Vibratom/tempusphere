'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';
import { UtensilsCrossed, Plus, BookOpen, Trash2, Edit, GitBranch, ArrowLeft, Search, Sparkles, ChefHat, ShoppingBag, CalendarPlus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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
import { useCalendar } from '@/contexts/CalendarContext';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


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

interface FoundRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
};

interface RecipeSearchOutput {
  recipes: FoundRecipe[];
};

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

const RecipeDetailView = ({ recipe, onViewRecipe, onEdit, onRemix, onDelete }: { recipe: Recipe, onViewRecipe: (recipe: Recipe) => void, onEdit: (recipe: Recipe) => void, onRemix: (recipe: Recipe) => void, onDelete: (id: string) => void }) => {
    const { recipes } = useRecipesContext();
    const { addList, addTask, lists } = useChecklist();
    const { addEvent, addEventType } = useCalendar();
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

    const handleAddToCalendar = (date: Date | undefined) => {
        if (!date) return;
        addEventType('Meals');
        addEvent({
            date: date.toISOString(),
            time: '18:00', // Default to 6 PM for dinner
            title: recipe.title,
            description: `Meal: ${recipe.title}`,
            color: 'orange',
            type: 'Meals'
        });
        toast({
            title: "Added to Meal Plan!",
            description: `Scheduled "${recipe.title}" for ${format(date, "PPP")}.`
        });
    }
    
    return (
        <Card className="w-full h-full flex flex-col border-0 shadow-none rounded-none">
            <CardHeader>
                <div className="flex justify-end items-center">
                    <div className="flex flex-wrap gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"><CalendarPlus className="mr-2 h-4 w-4" />Add to Meal Plan</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    onSelect={handleAddToCalendar}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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
            <CardContent className="flex-1 grid md:grid-cols-2 gap-8 overflow-y-auto">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineSearchQuery, setOnlineSearchQuery] = useState('');
  const [onlineSearchResults, setOnlineSearchResults] = useState<RecipeSearchOutput | null>(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  
  const { toast } = useToast();

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
  
  const handleOnlineSearch = async () => {
      if (!onlineSearchQuery.trim()) return;
      setIsSearchingOnline(true);
      setOnlineSearchResults(null);
      try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${onlineSearchQuery}`);
            if (!response.ok) {
                throw new Error("TheMealDB API request failed");
            }
            const data = await response.json();
            
            if (!data.meals) {
                setOnlineSearchResults({ recipes: [] });
                return;
            }

            const foundRecipes = data.meals.map((meal: any): FoundRecipe => {
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
            
            setOnlineSearchResults({ recipes: foundRecipes });
      } catch (error) {
          console.error("Online recipe search failed:", error);
          toast({ variant: 'destructive', title: 'Search Failed', description: 'Could not fetch recipes from the online database.'});
      } finally {
          setIsSearchingOnline(false);
      }
  }

  const handleImportRecipe = (recipeToImport: FoundRecipe) => {
      const newRecipe: Recipe = {
          ...recipeToImport,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
      };
      setRecipes(prev => [...prev, newRecipe]);
      toast({ title: 'Recipe Imported!', description: `"${newRecipe.title}" has been added to your cookbook.`});
  }
  
  const filteredRecipes = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  if (!isClient) {
      return (
         <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex flex-col items-center text-center mb-8">
                <UtensilsCrossed className="w-16 h-16 mb-4 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Recipe Remix</h1>
                <p className="text-lg text-muted-foreground mt-2">Your personal culinary journal.</p>
            </div>
        </div>
      )
  }

  const DiscoveryView = () => (
    <div className="h-full w-full flex flex-col p-4">
        <Tabs defaultValue="online" className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="online">Online Search</TabsTrigger>
                <TabsTrigger value="starter">Starter Cookbook</TabsTrigger>
            </TabsList>
            <TabsContent value="online" className="flex-1 flex flex-col">
                <div className="w-full flex flex-col sm:flex-row gap-2 my-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search TheMealDB..." className="pl-8" value={onlineSearchQuery} onChange={(e) => setOnlineSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleOnlineSearch()}/>
                    </div>
                    <Button onClick={handleOnlineSearch} disabled={isSearchingOnline}>
                        {isSearchingOnline ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                        Search
                    </Button>
                </div>
                 <ScrollArea className="flex-1 -mx-4">
                    <div className="px-4">
                        {isSearchingOnline ? (
                            <div className="flex justify-center items-center h-full pt-16"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>
                        ) : onlineSearchResults?.recipes && onlineSearchResults.recipes.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {onlineSearchResults.recipes.map(recipe => (
                                    <Card key={recipe.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            {recipe.imageUrl && (<div className="aspect-video relative w-full overflow-hidden rounded-md mb-4"><Image src={recipe.imageUrl} alt={recipe.title} layout="fill" objectFit="cover" unoptimized/></div>)}
                                            <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                        </CardHeader>
                                        <CardFooter className="mt-auto flex justify-end gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => handleImportRecipe(recipe)}><Plus className="mr-2 h-4 w-4"/>Import</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                                <Sparkles className="w-16 h-16 mb-4" />
                                <h3 className="text-xl font-semibold">Find Your Next Meal</h3>
                                <p className="text-sm max-w-xs">{onlineSearchResults ? 'No results found. Try a different search term.' : 'Search for recipes from a massive online database.'}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="starter" className="flex-1">
                 <ScrollArea className="h-full -mx-4">
                    <div className="space-y-4 px-4">
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
            </TabsContent>
        </Tabs>
    </div>
  );

  return (
    <RecipesContext.Provider value={{ recipes, setRecipes }}>
        <div className="w-full flex flex-col h-full gap-4 p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
                <UtensilsCrossed className="w-16 h-16 mb-4 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Recipe Remix</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Your personal culinary journal. Create, remix, and discover new recipes.</p>
            </div>
            
            <ResizablePanelGroup direction="horizontal" className="flex-1 border rounded-lg h-full min-h-[600px]">
                <ResizablePanel defaultSize={30} minSize={20}>
                   <div className="p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h2 className="text-2xl font-bold">My Cookbook</h2>
                            <Button size="icon" onClick={() => setEditingRecipe(null)}><Plus/></Button>
                        </div>
                        <div className="relative flex-1 mb-4">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search recipes..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <ScrollArea className="flex-1 -mx-4">
                             <div className="px-4">
                                {filteredRecipes.length > 0 ? (
                                    <div className="space-y-2">
                                        {filteredRecipes.map(recipe => (
                                            <button key={recipe.id} className={cn("w-full text-left p-3 rounded-md hover:bg-muted", viewingRecipe?.id === recipe.id && "bg-muted")} onClick={() => setViewingRecipe(recipe)}>
                                                <p className="font-semibold truncate">{recipe.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{recipe.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                                        <BookOpen className="w-12 h-12 mb-4" />
                                        <p className="text-sm">{recipes.length > 0 ? 'No recipes found.' : 'Your cookbook is empty.'}</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                   </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={70} minSize={30}>
                   {viewingRecipe ? (
                        <RecipeDetailView 
                            recipe={viewingRecipe}
                            onViewRecipe={setViewingRecipe}
                            onEdit={(recipe) => setEditingRecipe(recipe)}
                            onRemix={handleRemixRecipe}
                            onDelete={handleDeleteRecipe}
                        />
                   ) : (
                       <DiscoveryView />
                   )}
                </ResizablePanel>
            </ResizablePanelGroup>
          
          <Dialog open={editingRecipe !== undefined} onOpenChange={(isOpen) => !isOpen && setEditingRecipe(undefined)}>
            {editingRecipe !== undefined && <RecipeForm onSave={handleSaveRecipe} recipe={editingRecipe} onCancel={() => setEditingRecipe(undefined)}/>}
          </Dialog>
        </div>
    </RecipesContext.Provider>
  );
}
