'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';
import { UtensilsCrossed, Plus, BookOpen, Trash2, Edit, GitBranch, Search, ListChecks } from 'lucide-react';
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
import { useChecklist } from '@/contexts/ChecklistContext';
import { ChecklistProvider } from '@/contexts/ChecklistContext';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
  createdAt: string;
  remixedFrom?: string;
  checklistId?: string;
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
            remixedFrom: recipe?.remixedFrom,
            checklistId: recipe?.checklistId,
        };
        onSave(newRecipe);
    };

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{recipe?.id ? 'Edit Recipe' : 'Add a New Recipe'}</DialogTitle>
                <DialogDescription>
                    {recipe?.remixedFrom ? 'You are editing a remix. Your changes will be saved to this version.' : 'Add the details of your recipe below.'}
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

const RecipeDetailView = ({ recipe, recipes, onViewRecipe, onEdit, onRemix, onDelete, onUpdate }: { recipe: Recipe, recipes: Recipe[], onViewRecipe: (recipe: Recipe) => void, onEdit: (recipe: Recipe) => void, onRemix: (recipe: Recipe) => void, onDelete: (id: string) => void, onUpdate: (recipe: Recipe) => void }) => {
    const parentRecipe = recipe.remixedFrom ? recipes.find(r => r.id === recipe.remixedFrom) : null;
    const childRecipes = recipes.filter(r => r.remixedFrom === recipe.id);
    const { addList, lists } = useChecklist();

    useEffect(() => {
        if (recipe && !recipe.checklistId) {
            const checklistId = `recipe-${recipe.id}`;
            if (!lists.some(l => l.id === checklistId)) {
                addList({
                    id: checklistId,
                    title: `${recipe.title} - Prep List`,
                    tasks: [],
                });
            }
            onUpdate({ ...recipe, checklistId });
        }
    }, [recipe, addList, lists, onUpdate]);

    return (
        <SheetContent className="w-full sm:max-w-3xl p-0 flex flex-col">
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-3xl font-bold">{recipe.title}</SheetTitle>
                        {recipe.description && <SheetDescription className="text-base pt-2">{recipe.description}</SheetDescription>}
                    </SheetHeader>
                    <div className="my-4 flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => onEdit(recipe)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                        <Button onClick={() => onRemix(recipe)}><GitBranch className="mr-2 h-4 w-4"/>Remix</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the "{recipe.title}" recipe.
                                </AlertDialogDescription>
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
                            </div>
                        </TabsContent>
                        <TabsContent value="checklist">
                            {recipe.checklistId ? (
                                <ChecklistProvider>
                                    <ChecklistApp variant="project" />
                                </ChecklistProvider>
                            ) : <p>Loading checklist...</p>}
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
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes:listV4', []);
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
        <ScrollArea className="flex-1 -mx-2">
            <div className="px-2">
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
