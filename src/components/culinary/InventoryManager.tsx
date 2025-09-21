'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
}

const unitOptions = ['g', 'kg', 'oz', 'lb', 'mL', 'L', 'fl oz', 'tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon', 'items', 'cans', 'bottles'];

function ItemForm({ onSave, itemToEdit }: { onSave: (item: Omit<InventoryItem, 'id'>) => void; itemToEdit?: InventoryItem }) {
    const [name, setName] = useState(itemToEdit?.name || '');
    const [quantity, setQuantity] = useState(itemToEdit?.quantity || 0);
    const [unit, setUnit] = useState(itemToEdit?.unit || 'items');
    const [lowStockThreshold, setLowStockThreshold] = useState(itemToEdit?.lowStockThreshold || 0);
    const { toast } = useToast();

    const handleSave = () => {
        if (!name.trim()) {
            toast({ title: 'Item name is required', variant: 'destructive' });
            return;
        }
        onSave({ name, quantity, unit, lowStockThreshold });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{itemToEdit ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., All-Purpose Flour" />
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
                    <Input id="low-stock" type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(parseFloat(e.target.value) || 0)} placeholder="e.g., 100" />
                     <p className="text-xs text-muted-foreground">Get a warning when quantity falls to this level.</p>
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

export function InventoryManager() {
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('culinary:inventory-v1', []);
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

    const sortedInventory = [...inventory].sort((a,b) => a.name.localeCompare(b.name));

    return (
        <div className="w-full flex flex-col h-full gap-4">
             <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingItem(undefined); setIsFormOpen(isOpen); }}>
                <ItemForm onSave={handleSaveItem} itemToEdit={editingItem} />
            </Dialog>
            <div className="flex justify-end">
                <Button onClick={openAddForm}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Keep track of all your ingredients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="w-48 text-right">Quantity</TableHead>
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedInventory.length > 0 ? sortedInventory.map(item => {
                                    const isLowStock = item.quantity <= item.lowStockThreshold;
                                    return (
                                        <TableRow key={item.id} className={cn(isLowStock && 'bg-yellow-100/50 dark:bg-yellow-900/30')}>
                                            <TableCell>
                                                <p className="font-medium cursor-pointer hover:underline" onClick={() => openEditForm(item)}>{item.name}</p>
                                                {isLowStock && <p className="text-xs text-yellow-600 dark:text-yellow-400">Low Stock</p>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><ArrowDown className="h-4 w-4"/></Button>
                                                    <span className="font-mono w-16 text-center">{item.quantity} {item.unit}</span>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><ArrowUp className="h-4 w-4"/></Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            Your inventory is empty. Add your first item to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
