'use client';

import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    category: string;
}

type StockStatus = 'In Stock' | 'Running Low' | 'Out of Stock';

const unitOptions = ['g', 'kg', 'oz', 'lb', 'mL', 'L', 'fl oz', 'tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon', 'items', 'cans', 'bottles'];
const categoryOptions = ['Pantry', 'Fridge', 'Freezer', 'Spices & Oils', 'Other'];

function ItemForm({ onSave, itemToEdit }: { onSave: (item: Omit<InventoryItem, 'id'>) => void; itemToEdit?: InventoryItem }) {
    const [name, setName] = useState(itemToEdit?.name || '');
    const [quantity, setQuantity] = useState(itemToEdit?.quantity ?? 0);
    const [unit, setUnit] = useState(itemToEdit?.unit || 'items');
    const [lowStockThreshold, setLowStockThreshold] = useState(itemToEdit?.lowStockThreshold || 1);
    const [category, setCategory] = useState(itemToEdit?.category || categoryOptions[0]);
    const { toast } = useToast();

    const handleSave = () => {
        if (!name.trim()) {
            toast({ title: 'Item name is required', variant: 'destructive' });
            return;
        }
        onSave({ name, quantity, unit, lowStockThreshold, category });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{itemToEdit ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., All-Purpose Flour" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                         <Select value={unit} onValueChange={setUnit}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="low-stock">Low Stock Threshold</Label>
                    <Input id="low-stock" type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(parseFloat(e.target.value) || 0)} placeholder="e.g., 1" />
                     <p className="text-xs text-muted-foreground">"Running Low" warning will show when quantity is at or below this level.</p>
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button onClick={handleSave}>Save Item</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

const getStockStatus = (item: InventoryItem): StockStatus => {
    if (item.quantity <= 0) return 'Out of Stock';
    if (item.quantity <= item.lowStockThreshold) return 'Running Low';
    return 'In Stock';
}

const StockBadge = ({ status }: { status: StockStatus }) => {
    const variants: Record<StockStatus, 'default' | 'secondary' | 'destructive'> = {
        'In Stock': 'secondary',
        'Running Low': 'default',
        'Out of Stock': 'destructive',
    }
    const colorClasses: Record<StockStatus, string> = {
        'In Stock': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Running Low': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Out of Stock': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    }

    return <Badge variant={variants[status]} className={cn('w-24 justify-center', colorClasses[status])}>{status}</Badge>
}

const CategoryColumn = ({ title, items, onUpdate, onRemove, onEdit }: { title: string, items: InventoryItem[], onUpdate: (id: string, amount: number) => void, onRemove: (id: string) => void, onEdit: (item: InventoryItem) => void }) => (
    <div className="flex flex-col gap-2 min-w-[320px]">
        <h3 className="font-bold text-lg text-center pb-2 border-b-2">{title}</h3>
        <ScrollArea className="h-[60vh]">
            <div className="space-y-2 pr-4">
            {items.map(item => (
                <Card key={item.id} className="p-2">
                    <div className="flex items-center justify-between">
                         <p className="font-medium cursor-pointer hover:underline" onClick={() => onEdit(item)}>{item.name}</p>
                         <StockBadge status={getStockStatus(item)} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate(item.id, -1)}><ArrowDown className="h-4 w-4"/></Button>
                            <span className="font-mono w-16 text-center text-sm text-muted-foreground">{item.quantity} {item.unit}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate(item.id, 1)}><ArrowUp className="h-4 w-4"/></Button>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/></Button>
                    </div>
                </Card>
            ))}
            {items.length === 0 && <p className="text-center text-muted-foreground pt-10">No items in this category.</p>}
            </div>
        </ScrollArea>
    </div>
);


export function InventoryManager() {
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('culinary:inventory-v2', []);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);
    const { toast } = useToast();

    const handleSaveItem = (itemData: Omit<InventoryItem, 'id'>) => {
        if (editingItem) {
            setInventory(prev => prev.map(item => item.id === editingItem.id ? { ...editingItem, ...itemData } : item));
            toast({ title: 'Item Updated' });
        } else {
            const newItem = { ...itemData, id: uuidv4() };
            setInventory(prev => [...prev, newItem]);
            toast({ title: 'Item Added' });
        }
        setIsFormOpen(false);
        setEditingItem(undefined);
    };
    
    const openAddForm = () => {
        setEditingItem(undefined);
        setIsFormOpen(true);
    }
    
    const openEditForm = (item: InventoryItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }

    const removeItem = (id: string) => {
        setInventory(prev => prev.filter(item => item.id !== id));
        toast({ title: 'Item Removed' });
    }

    const updateQuantity = (id: string, amount: number) => {
        setInventory(prev => prev.map(item => 
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item
        ));
    }

    const { categorizedItems, timeToBuy } = useMemo(() => {
        const categorized: Record<string, InventoryItem[]> = {};
        categoryOptions.forEach(cat => categorized[cat] = []);

        const toBuy: InventoryItem[] = [];

        inventory.sort((a,b) => a.name.localeCompare(b.name)).forEach(item => {
            if (categorized[item.category]) {
                categorized[item.category].push(item);
            } else {
                 categorized['Other'].push(item);
            }
            if (getStockStatus(item) !== 'In Stock') {
                toBuy.push(item);
            }
        });

        return { categorizedItems: categorized, timeToBuy: toBuy };
    }, [inventory]);

    return (
        <div className="w-full flex flex-col h-full gap-4">
             <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingItem(undefined); setIsFormOpen(isOpen); }}>
                <ItemForm onSave={handleSaveItem} itemToEdit={editingItem} />
            </Dialog>
            <div className="flex justify-end">
                <Button onClick={openAddForm}><Plus className="mr-2 h-4 w-4" /> Add New Item</Button>
            </div>
            <Card className="flex-1 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-center">Food Inventory</CardTitle>
                    <CardDescription className="text-center">Last Updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea>
                        <div className="flex gap-4 pb-4">
                           {categoryOptions.map(category => (
                                <CategoryColumn 
                                    key={category} 
                                    title={category}
                                    items={categorizedItems[category]}
                                    onUpdate={updateQuantity}
                                    onRemove={removeItem}
                                    onEdit={openEditForm}
                                />
                           ))}
                           <div className="flex flex-col gap-2 min-w-[200px] border-l-4 border-dashed pl-4">
                                <h3 className="font-bold text-lg text-center pb-2 border-b-2">Time to Buy</h3>
                                <ScrollArea className="h-[60vh]">
                                    <div className="space-y-1 pr-4">
                                        {timeToBuy.length > 0 ? timeToBuy.map(item => (
                                            <div key={item.id} className="text-sm p-1 border-b">
                                                {item.name}
                                            </div>
                                        )) : <p className="text-center text-muted-foreground pt-10">All items are in stock!</p>}
                                    </div>
                                </ScrollArea>
                           </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
