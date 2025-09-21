
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface WasteEntry {
  id: string;
  date: string;
  metric: 'Overproduction' | 'Spoilage' | 'Preparation Waste' | 'Other';
  quantity: number;
  unit: 'kg' | 'g' | 'lb' | 'oz' | 'items';
  cost: number;
}

const createNewWasteEntry = (): WasteEntry => ({
  id: uuidv4(),
  date: new Date().toISOString().split('T')[0],
  metric: 'Overproduction',
  quantity: 0,
  unit: 'kg',
  cost: 0,
});

export default function WasteTrackerPage() {
    const [entries, setEntries] = useLocalStorage<WasteEntry[]>('culinary:waste-tracker-v1', []);
    const [isAdding, setIsAdding] = useState(false);
    const [newEntry, setNewEntry] = React.useState<WasteEntry>(createNewWasteEntry());
    const { toast } = useToast();

    const handleNewEntryChange = (field: keyof WasteEntry, value: string | number) => {
        setNewEntry(prev => ({...prev, [field]: value}));
    };

    const addEntry = () => {
        if (newEntry.quantity <= 0) {
            toast({ title: "Invalid Quantity", description: "Please enter a quantity greater than zero.", variant: "destructive" });
            return;
        }
        setEntries(prev => [...prev, newEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setNewEntry(createNewWasteEntry());
        setIsAdding(false);
    };

    const removeEntry = (id: string) => {
        setEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const totalCost = React.useMemo(() => entries.reduce((sum, entry) => sum + entry.cost, 0), [entries]);
    const totalQuantityKg = React.useMemo(() => {
        return entries.reduce((sum, entry) => {
            let quantityInKg = 0;
            switch(entry.unit) {
                case 'g': quantityInKg = entry.quantity / 1000; break;
                case 'lb': quantityInKg = entry.quantity * 0.453592; break;
                case 'oz': quantityInKg = entry.quantity * 0.0283495; break;
                case 'kg': quantityInKg = entry.quantity; break;
                default: quantityInKg = 0; // 'items' not summed in kg
            }
            return sum + quantityInKg;
        }, 0);
    }, [entries]);

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Food Waste Tracker</CardTitle>
                            <CardDescription>Log and monitor discarded food to identify areas for improvement.</CardDescription>
                        </div>
                        {!isAdding && <Button onClick={() => setIsAdding(true)}><Plus className="mr-2 h-4 w-4" /> Log Waste</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Metric</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isAdding && (
                                <TableRow className="bg-muted/50">
                                    <TableCell><Input type="date" value={newEntry.date} onChange={e => handleNewEntryChange('date', e.target.value)} /></TableCell>
                                    <TableCell>
                                        <Select value={newEntry.metric} onValueChange={v => handleNewEntryChange('metric', v)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Overproduction">Overproduction</SelectItem>
                                                <SelectItem value="Spoilage">Spoilage</SelectItem>
                                                <SelectItem value="Preparation Waste">Preparation Waste</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Input type="number" value={newEntry.quantity || ''} onChange={e => handleNewEntryChange('quantity', parseFloat(e.target.value))} className="w-24 text-right"/>
                                            <Select value={newEntry.unit} onValueChange={v => handleNewEntryChange('unit', v)}>
                                                <SelectTrigger className="w-20"><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kg">kg</SelectItem>
                                                    <SelectItem value="g">g</SelectItem>
                                                    <SelectItem value="lb">lb</SelectItem>
                                                    <SelectItem value="oz">oz</SelectItem>
                                                    <SelectItem value="items">items</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right"><Input type="number" value={newEntry.cost || ''} onChange={e => handleNewEntryChange('cost', parseFloat(e.target.value))} className="w-24 text-right" placeholder="0.00" /></TableCell>
                                    <TableCell>
                                        <Button onClick={addEntry}>Add</Button>
                                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    </TableCell>
                                </TableRow>
                            )}
                            {entries.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>{format(new Date(entry.date), 'dd.MM.yyyy')}</TableCell>
                                    <TableCell>{entry.metric}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.quantity.toFixed(1)} {entry.unit}</TableCell>
                                    <TableCell className="text-right font-mono">${entry.cost.toFixed(2)}</TableCell>
                                    <TableCell>
                                       <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete this waste entry.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => removeEntry(entry.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {entries.length === 0 && !isAdding && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground h-48">No waste logged yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="flex justify-end gap-8 bg-muted p-4">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Wasted Quantity</p>
                        <p className="font-bold font-mono text-lg">{totalQuantityKg.toFixed(2)} kg</p>
                    </div>
                     <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Wasted Cost</p>
                        <p className="font-bold font-mono text-lg text-destructive">${totalCost.toFixed(2)}</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
