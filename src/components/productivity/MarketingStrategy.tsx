
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Package, Tag, Store, Megaphone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

type MarketingCategory = 'product' | 'price' | 'place' | 'promotion';

interface MarketingItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): MarketingItem => ({ id: uuidv4(), text });

const MarketingColumn = ({ title, category, items, setItems, placeholder, className, icon: Icon }: { title: string, category: MarketingCategory, items: MarketingItem[], setItems: React.Dispatch<React.SetStateAction<MarketingItem[]>>, placeholder: string, className?: string, icon: React.ElementType }) => {
    const [newItemText, setNewItemText] = useState('');

    const addItem = () => {
        if (newItemText.trim()) {
            setItems(prev => [...prev, createNewItem(newItemText)]);
            setNewItemText('');
        }
    };

    const updateItem = (id: string, newText: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="flex-row items-center gap-2">
                <Icon className="w-6 h-6" />
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2">
                <div className="space-y-2 p-2 rounded-md min-h-[100px] flex-1">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                            <Input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="border-none focus-visible:ring-0" />
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={newItemText}
                        onChange={e => setNewItemText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addItem()}
                        placeholder={placeholder}
                    />
                    <Button onClick={addItem}><Plus /></Button>
                </div>
            </CardContent>
        </Card>
    );
};

export function MarketingStrategy() {
    const [title, setTitle] = useLocalStorage('marketing-strategy:title', 'My Marketing Strategy');
    const [products, setProducts] = useLocalStorage<MarketingItem[]>('marketing-strategy:product', []);
    const [prices, setPrices] = useLocalStorage<MarketingItem[]>('marketing-strategy:price', []);
    const [places, setPlaces] = useLocalStorage<MarketingItem[]>('marketing-strategy:place', []);
    const [promotions, setPromotions] = useLocalStorage<MarketingItem[]>('marketing-strategy:promotion', []);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Marketing Strategy</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Organize your marketing plan using the 4 Ps framework: Product, Price, Place, and Promotion.
                </p>
            </div>
            
            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MarketingColumn title="Product" category="product" items={products} setItems={setProducts} placeholder="e.g., Quality, Features..." icon={Package} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" />
                <MarketingColumn title="Price" category="price" items={prices} setItems={setPrices} placeholder="e.g., List price, Discounts..." icon={Tag} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" />
                <MarketingColumn title="Place" category="place" items={places} setItems={setPlaces} placeholder="e.g., Distribution channels..." icon={Store} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
                <MarketingColumn title="Promotion" category="promotion" items={promotions} setItems={setPromotions} placeholder="e.g., Advertising, PR..." icon={Megaphone} className="bg-red-100/30 dark:bg-red-900/30 border-red-500" />
            </div>
        </div>
    );
}
