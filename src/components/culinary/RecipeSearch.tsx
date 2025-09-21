
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, ChefHat, Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { searchRecipes, type RecipeSearchOutput } from '@/ai/flows/recipe-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

// This is a simplified detail view for the search results
const RecipeDetailDialog = ({ product, onOpenChange }: { product: any, onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{product.product_name}</DialogTitle>
                    <DialogDescription>{product.generic_name_en}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="pr-4 space-y-4">
                        {product.image_url && <Image src={product.image_url} alt={product.product_name} width={400} height={300} className="rounded-md mx-auto" />}
                        
                        <div>
                            <h3 className="font-semibold mb-2">Ingredients</h3>
                            <p className="text-sm text-muted-foreground">{product.ingredients_text || 'Not available.'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Allergens</h3>
                            <p className="text-sm text-muted-foreground">{product.allergens || 'Not specified.'}</p>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button asChild variant="secondary"><a href={`https://world.openfoodfacts.org/product/${product.id}`} target="_blank" rel="noopener noreferrer">View on Open Food Facts</a></Button>
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
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const searchResult = await searchRecipes({ query });
            setResults(searchResult);
            toast({ title: 'Search Complete', description: `Found ${searchResult.length} products.` });
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to fetch products. ${errorMessage}`);
            toast({ variant: 'destructive', title: 'Search Failed', description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleViewProduct = async (productId: string) => {
        const url = `https://world.openfoodfacts.org/api/v0/product/${productId}.json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch product details.');
            const data = await response.json();
            if(data.product) {
                setSelectedProduct(data.product);
            } else {
                throw new Error('Product not found in API response.');
            }
        } catch(e) {
            toast({variant: 'destructive', title: 'Error', description: 'Could not fetch product details.'});
        }
    }

    return (
        <div className="w-full flex flex-col h-full gap-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search for food products..."
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
                                    {results.map(product => (
                                        <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewProduct(product.id)}>
                                            <CardHeader className="p-0">
                                                {product.thumbnail_url ? <div className="aspect-video relative">
                                                    <Image src={product.thumbnail_url} alt={product.name} layout="fill" objectFit="cover" className="rounded-t-lg" unoptimized/>
                                                </div> : <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center"><ChefHat className="h-10 w-10 text-muted-foreground"/></div>}
                                            </CardHeader>
                                            <CardContent className="p-3">
                                                <p className="font-semibold truncate">{product.name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{product.description || 'No description available.'}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                    <ChefHat className="h-16 w-16 mb-4"/>
                                    <h3 className="font-semibold text-lg">Search Open Food Facts</h3>
                                    <p className="text-sm">Use the search bar above to find products from a global database.</p>
                                </div>
                            )}
                         </div>
                    </ScrollArea>
                </CardContent>
            </Card>
            {selectedProduct && <RecipeDetailDialog product={selectedProduct} onOpenChange={() => setSelectedProduct(null)} />}
        </div>
    );
}
