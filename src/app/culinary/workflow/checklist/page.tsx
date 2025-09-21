'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, getDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface PrepItem {
  id: string;
  type: 'category' | 'item';
  name: string;
  slowPar?: string;
  busyPar?: string;
  prep: string[]; // Array for 7 days, Mon-Sun
}

const createNewItem = (type: 'category' | 'item', name: string = ''): PrepItem => ({
  id: uuidv4(),
  type,
  name,
  slowPar: '',
  busyPar: '',
  prep: Array(7).fill(''),
});

const initialData: PrepItem[] = [
    createNewItem('category', 'Salmon'),
    createNewItem('item', '8 oz Sockeye, S/on'),
    createNewItem('item', 'Cedar Boards'),
    createNewItem('item', 'House Salm Seasoning'),
    createNewItem('category', 'Halibut'),
    createNewItem('item', '7 oz Halibut, bias cut'),
    createNewItem('category', 'Ribeye Steaks 14 oz'),
    createNewItem('category', 'Cippolini Onions'),
];

export default function RecipeChecklistPage() {
    const [title, setTitle] = useLocalStorage('prep-checklist:title', 'Grill Station');
    const [prepList, setPrepList] = useLocalStorage<PrepItem[]>('prep-checklist:list-v1', initialData);
    const [stationResponsibilities, setStationResponsibilities] = useLocalStorage('prep-checklist:responsibilities', "You are responsible for this Station all day and all its prep.\nTaste EVERYTHING!!\nHave the Chef taste every recipe before you consider the recipe complete.");
    const [todayIndex, setTodayIndex] = useState(0);

    useEffect(() => {
        // Monday is 1, Sunday is 0. We want Monday to be 0.
        const day = getDay(new Date());
        setTodayIndex(day === 0 ? 6 : day - 1);
    }, []);

    const handleItemChange = (id: string, field: keyof PrepItem, value: string) => {
        setPrepList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handlePrepChange = (id: string, dayIndex: number, value: string) => {
        setPrepList(prev => prev.map(item => {
            if (item.id === id) {
                const newPrep = [...item.prep];
                newPrep[dayIndex] = value;
                return { ...item, prep: newPrep };
            }
            return item;
        }));
    };
    
    const addItem = (type: 'category' | 'item') => {
        setPrepList(prev => [...prev, createNewItem(type, `New ${type}`)]);
    };

    const removeItem = (id: string) => {
        setPrepList(prev => prev.filter(item => item.id !== id));
    };

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">Black Mountain Prep - <Input value={title} onChange={(e) => setTitle(e.target.value)} className="inline-block w-auto p-0 h-auto text-2xl border-none focus-visible:ring-0" /></CardTitle>
                            <CardDescription>Daily preparation checklist for the station.</CardDescription>
                        </div>
                         <div className="flex gap-2">
                            <Button onClick={() => addItem('item')}><Plus className="mr-2 h-4 w-4"/>Add Item</Button>
                            <Button onClick={() => addItem('category')} variant="outline"><Plus className="mr-2 h-4 w-4"/>Add Category</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <ScrollArea className="w-full">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead className="w-[250px]">Item</TableHead>
                                    <TableHead className="w-[100px]">Slow Par</TableHead>
                                    <TableHead className="w-[100px]">Busy Par</TableHead>
                                    {weekDays.map((day, index) => (
                                        <TableHead key={day} className={cn("w-[100px]", index === todayIndex && "bg-primary/20")}>{day}</TableHead>
                                    ))}
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prepList.map(item => (
                                    item.type === 'category' ? (
                                        <TableRow key={item.id} className="bg-muted/50 hover:bg-muted/50">
                                            <TableCell colSpan={10} className="font-bold p-2">
                                                 <div className="flex items-center justify-between">
                                                    <Input 
                                                        value={item.name} 
                                                        onChange={e => handleItemChange(item.id, 'name', e.target.value)} 
                                                        className="border-none bg-transparent h-auto p-0 font-bold focus-visible:ring-0"
                                                    />
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow key={item.id}>
                                            <TableCell className="pl-6">
                                                <Input 
                                                    value={item.name} 
                                                    onChange={e => handleItemChange(item.id, 'name', e.target.value)} 
                                                    className="border-none h-auto p-0 focus-visible:ring-0"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    value={item.slowPar} 
                                                    onChange={e => handleItemChange(item.id, 'slowPar', e.target.value)} 
                                                    className="border-none h-auto p-0 focus-visible:ring-0"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    value={item.busyPar} 
                                                    onChange={e => handleItemChange(item.id, 'busyPar', e.target.value)}
                                                    className="border-none h-auto p-0 focus-visible:ring-0"
                                                />
                                            </TableCell>
                                            {weekDays.map((_, index) => (
                                                <TableCell key={index} className={cn(index === todayIndex && "bg-primary/10")}>
                                                    <Input 
                                                        value={item.prep[index]} 
                                                        onChange={e => handlePrepChange(item.id, index, e.target.value)}
                                                        className="border-none h-auto p-0 focus-visible:ring-0"
                                                    />
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                ))}
                            </TableBody>
                        </Table>
                         <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                     <div className="w-full space-y-2">
                        <h4 className="font-semibold">Station Responsibilities</h4>
                        <Textarea 
                            value={stationResponsibilities}
                            onChange={(e) => setStationResponsibilities(e.target.value)}
                            rows={4}
                        />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
