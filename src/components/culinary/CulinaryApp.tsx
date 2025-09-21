'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';
import { UtensilsCrossed, Plus, BookOpen, Trash2, Edit, GitBranch, Search, ListChecks, Clock, Users, Flame } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ChecklistApp } from '../checklist/ChecklistApp';
import { useChecklist, Checklist } from '@/contexts/ChecklistContext';
import { Checkbox } from '../ui/checkbox';

export interface Recipe {
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

const RecipeForm = ({ onSave, recipe, onCancel }: { onSave: (recipe: Recipe) => void, recipe?: Recipe | null, onCancel: () => void }) => {
    const [title, setTitle] = useState(recipe?.title || '');
    const [category, setCategory] = useState(recipe?.category || '');
    const [description, setDescription] = useState(recipe?.description || '');
    const [ingredients, setIngredients] = useState(recipe?.ingredients || '');
    const [instructions, setInstructions] = useState(recipe?.instructions || '');
    const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || '');
    const [serves, setServes] = useState(recipe?.serves || '');
    const [prepTime, setPrepTime] = useState(recipe?.prepTime || '');
    const [cookTime, setCookTime] = useState(recipe?.cookTime || '');
    const [notes, setNotes] = useState(recipe?.notes || '');


    useEffect(() => {
        if (recipe) {
            setTitle(recipe.title);
            setCategory(recipe.category || '');
            setDescription(recipe.description);
            setIngredients(recipe.ingredients);
            setInstructions(recipe.instructions);
            setImageUrl(recipe.imageUrl || '');
            setServes(recipe.serves || '');
            setPrepTime(recipe.prepTime || '');
            setCookTime(recipe.cookTime || '');
            setNotes(recipe.notes || '');
        } else {
            setTitle('');
            setCategory('');
            setDescription('');
            setIngredients('');
            setInstructions('');
            setImageUrl('');
            setServes('');
            setPrepTime('');
            setCookTime('');
            setNotes('');
        }
    }, [recipe]);

    const handleSave = () => {
        if (!title.trim()) return;
        const newRecipe: Recipe = {
            id: recipe?.id || uuidv4(),
            title,
            category,
            description,
            ingredients,
            instructions,
            imageUrl,
            serves,
            prepTime,
            cookTime,
            notes,
            createdAt: recipe?.createdAt || new Date().toISOString(),
            remixedFrom: recipe?.remixedFrom,
            checklistId: recipe?.checklistId,
        };
        onSave(newRecipe);
    };

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>{recipe?.id ? 'Edit Recipe' : 'Add a New Recipe'}</DialogTitle>
                <DialogDescription>
                    {recipe?.remixedFrom ? 'You are editing a remix. Your changes will be saved to this version.' : 'Add the details of your recipe below.'}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Recipe Title</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Grandma's Famous Cookies" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category (e.g., Deserts)</Label>
                        <Input id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Deserts" />
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="description">Description / Story</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A short description or the story behind this recipe." />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="serves">Serves</Label>
                        <Input id="serves" value={serves} onChange={e => setServes(e.target.value)} placeholder="e.g., 12" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="prep-time">Prep Time</Label>
                        <Input id="prep-time" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="e.g., 40m" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="cook-time">Cook Time</Label>
                        <Input id="cook-time" value={cookTime} onChange={e => setCookTime(e.target.value)} placeholder="e.g., 20m" />
                    </div>
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="ingredients">Ingredients (one per line, use headers with ':')</Label>
                        <Textarea id="ingredients" value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="CUPCAKE MIX:&#10;120g Butter&#10;120g Caster Sugar..." rows={12} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="instructions">Instructions (one step per line)</Label>
                        <Textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="1. Preheat oven to 180C..." rows={12} />
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any extra notes here." />
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

const RecipeChecklist = ({ recipe }: { recipe: Recipe }) => {
    const { lists, addList } = useChecklist();
    const [recipeList, setRecipeList] = useState<Checklist | null>(null);

    useEffect(() => {
        if (recipe.checklistId) {
            const foundList = lists.find(l => l.id === recipe.checklistId);
            if (foundList) {
                setRecipeList(foundList);
            } else {
                // The ID exists but the list doesn't, maybe it was deleted. We could recreate it.
                const newList = { id: recipe.checklistId, title: `${recipe.title} - Prep List`, tasks: [] };
                addList(newList);
                setRecipeList(newList);
            }
        }
    }, [recipe, lists, addList]);

    if (!recipe.checklistId || !recipeList) {
        return <p>Loading checklist...</p>;
    }
    
    // This is a bit of a trick to render just one checklist
    return <ChecklistApp variant="project" />;
};


const RecipeDetailView = ({ recipe, recipes, onViewRecipe, onEdit, onRemix, onDelete, onUpdate }: { recipe: Recipe, recipes: Recipe[], onViewRecipe: (recipe: Recipe) => void, onEdit: (recipe: Recipe) => void, onRemix: (recipe: Recipe) => void, onDelete: (id: string) => void, onUpdate: (recipe: Recipe) => void }) => {
    const parentRecipe = recipe.remixedFrom ? recipes.find(r => r.id === recipe.remixedFrom) : null;
    const childRecipes = recipes.filter(r => r.remixedFrom === recipe.id);
    const { addList, lists } = useChecklist();

    const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setCheckedIngredients({});
    }, [recipe]);

    useEffect(() => {
        if (recipe && !recipe.checklistId) {
            const checklistId = `recipe-${recipe.id}`;
            const existingList = lists.find(l => l.id === checklistId);
            
            if (!existingList) {
                addList({
                    id: checklistId,
                    title: `${recipe.title} - Prep List`,
                    tasks: [],
                });
            }
            onUpdate({ ...recipe, checklistId });
        }
    }, [recipe, addList, lists, onUpdate]);

    const parsedIngredients = React.useMemo(() => {
        const sections: { title: string, items: string[] }[] = [];
        let currentSection: { title: string, items: string[] } | null = null;

        recipe.ingredients.split('\n').forEach(line => {
            if (line.trim().endsWith(':')) {
                if (currentSection) sections.push(currentSection);
                currentSection = { title: line.trim().slice(0, -1), items: [] };
            } else if (line.trim()) {
                if (!currentSection) {
                    currentSection = { title: 'main', items: [] };
                }
                currentSection.items.push(line.trim());
            }
        });
        if (currentSection) sections.push(currentSection);
        return sections;
    }, [recipe.ingredients]);
    
    const parsedInstructions = React.useMemo(() => {
        return recipe.instructions.split('\n').filter(line => line.trim());
    }, [recipe.instructions]);

    const toggleIngredient = (ingredient: string) => {
        setCheckedIngredients(prev => ({ ...prev, [ingredient]: !prev[ingredient] }));
    }

    return (
        <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col">
            <ScrollArea className="flex-1">
                <div className="p-6 md:p-8">
                    <SheetHeader className="mb-6 text-center space-y-2">
                        {recipe.category && <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">{recipe.category}</p>}
                        <SheetTitle className="text-4xl md:text-5xl font-bold tracking-tighter">{recipe.title}</SheetTitle>
                    </SheetHeader>

                    <div className="flex justify-center items-center gap-6 md:gap-8 text-sm text-muted-foreground border-y py-3 mb-6">
                        {recipe.serves && <div className="flex items-center gap-2"><Users className="h-4 w-4"/><span>SERVES: {recipe.serves}</span></div>}
                        {recipe.prepTime && <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>PREP TIME: {recipe.prepTime}</span></div>}
                        {recipe.cookTime && <div className="flex items-center gap-2"><Flame className="h-4 w-4"/><span>COOK TIME: {recipe.cookTime}</span></div>}
                    </div>

                    <div className="my-4 flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => onEdit(recipe)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                        <Button onClick={() => onRemix(recipe)}><GitBranch className="mr-2 h-4 w-4"/>Remix</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{recipe.title}" recipe.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(recipe.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <Separator className="my-6" />

                    <Tabs defaultValue="details">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details"><BookOpen className="mr-2 h-4 w-4"/>Details</TabsTrigger>
                            <TabsTrigger value="checklist"><ListChecks className="mr-2 h-4 w-4"/>Prep Checklist</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-semibold border-b pb-2 tracking-tight">Ingredients</h3>
                                    {parsedIngredients.map((section, idx) => (
                                        <div key={idx} className="space-y-2">
                                            {section.title !== 'main' && <h4 className="font-semibold uppercase text-sm tracking-wider text-muted-foreground">{section.title}</h4>}
                                            {section.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="flex items-center gap-3">
                                                    <Checkbox id={`${idx}-${itemIdx}`} checked={!!checkedIngredients[item]} onCheckedChange={() => toggleIngredient(item)} />
                                                    <label htmlFor={`${idx}-${itemIdx}`} className="text-base cursor-pointer">{item}</label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                    {recipe.notes && (
                                        <div className="pt-4">
                                            <h3 className="text-2xl font-semibold border-b pb-2 tracking-tight">Notes</h3>
                                            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">{recipe.notes}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-semibold border-b pb-2 tracking-tight">Directions</h3>
                                    <ol className="list-decimal list-outside pl-5 space-y-3 text-base">
                                        {parsedInstructions.map((step, idx) => <li key={idx}>{step}</li>)}
                                    </ol>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="checklist">
                           {recipe.checklistId && <RecipeChecklist recipe={recipe} />}
                        </TabsContent>
                    </Tabs>

                    {(parentRecipe || childRecipes.length > 0) && (
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-2xl font-semibold mb-4">Recipe Lineage</h3>
                            {parentRecipe && (
                                <div className="space-y-2 mb-4">
                                    <h4 className="font-medium">Remixed From</h4>
                                    <Card className="w-full cursor-pointer hover:bg-muted" onClick={() => onViewRecipe(parentRecipe)}>
                                        <CardHeader><CardTitle className="text-lg">{parentRecipe.title}</CardTitle></CardHeader>
                                    </Card>
                                </div>
                            )}
                            {childRecipes.length > 0 && (
                                <div className="w-full space-y-2">
                                    <h4 className="font-medium">Remixed Into</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                    {childRecipes.map(child => (
                                        <Card key={child.id} className="cursor-pointer hover:bg-muted" onClick={() => onViewRecipe(child)}>
                                            <CardHeader><CardTitle className="text-lg">{child.title}</CardTitle></CardHeader>
                                        </Card>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </SheetContent>
    );
};

export function CulinaryApp() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes:listV5', []);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null | undefined>(undefined);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveRecipe = (recipe: Recipe) => {
    const existingIndex = recipes.findIndex(r => r.id === recipe.id);
    if (existingIndex > -1) {
        setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
    } else {
        setRecipes(prev => [...prev, recipe]);
    }
    setEditingRecipe(undefined);
  }

  const handleRemixRecipe = (originalRecipe: Recipe) => {
    const remixedRecipe: Recipe = {
      ...originalRecipe,
      id: uuidv4(),
      title: `${originalRecipe.title} (Remix)`,
      createdAt: new Date().toISOString(),
      remixedFrom: originalRecipe.id,
      checklistId: undefined, // Needs a new checklist
    };
    setRecipes(prev => [...prev, remixedRecipe]);
    setViewingRecipe(remixedRecipe);
  }

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(r => r.id !== recipeId));
    setViewingRecipe(null);
  }
  
  const filteredRecipes = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  if (!isClient) {
      return null;
  }
  
  return (
    <div className="w-full flex flex-col h-full gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search your cookbook..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={() => setEditingRecipe(null)}><Plus className="mr-2"/>Add New Recipe</Button>
        </div>
        <ScrollArea className="flex-1 -mx-4">
            <div className="px-4">
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredRecipes.map(recipe => (
                            <Card key={recipe.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setViewingRecipe(recipe)}>
                                <CardHeader>
                                    {recipe.imageUrl && (<div className="aspect-video relative w-full overflow-hidden rounded-md mb-4"><Image src={recipe.imageUrl} alt={recipe.title} layout="fill" objectFit="cover" unoptimized/></div>)}
                                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                        <BookOpen className="w-12 h-12 mb-4" />
                        <p className="text-sm">{recipes.length > 0 ? 'No recipes found for your search.' : 'Your cookbook is empty.'}</p>
                    </div>
                )}
            </div>
        </ScrollArea>
        
        <Sheet open={viewingRecipe !== null} onOpenChange={(open) => !open && setViewingRecipe(null)}>
            {viewingRecipe && <RecipeDetailView recipe={viewingRecipe} recipes={recipes} onViewRecipe={setViewingRecipe} onEdit={setEditingRecipe} onRemix={handleRemixRecipe} onDelete={handleDeleteRecipe} onUpdate={handleSaveRecipe} />}
        </Sheet>
        
        <Dialog open={editingRecipe !== undefined} onOpenChange={(isOpen) => !isOpen && setEditingRecipe(undefined)}>
            {editingRecipe !== undefined && <RecipeForm onSave={handleSaveRecipe} recipe={editingRecipe} onCancel={() => setEditingRecipe(undefined)}/>}
        </Dialog>
    </div>
  );
}
