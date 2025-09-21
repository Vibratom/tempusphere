'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    cost: number;
}

interface UtilityCost {
    id: string;
    name: string;
    cost: number;
}

const createNewIngredient = (): Ingredient => ({ id: uuidv4(), name: '', quantity: 1, cost: 0 });
const createNewUtilityCost = (): UtilityCost => ({ id: uuidv4(), name: '', cost: 0 });

const IngredientTable = ({ title, items, setItems }: { title: string, items: Ingredient[], setItems: React.Dispatch<React.SetStateAction<Ingredient[]>> }) => {
    const handleItemChange = (id: string, field: keyof Ingredient, value: string | number) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => setItems(prev => [...prev, createNewIngredient()]);
    const removeItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.cost), 0), [items]);

    return (
        <Card>
            <CardHeader className="bg-muted p-2 rounded-t-lg">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/2">Product Name</TableHead>
                            <TableHead>Qty.</TableHead>
                            <TableHead>Cost (per unit)</TableHead>
                            <TableHead>Total Cost</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell><Input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="h-8" /></TableCell>
                                <TableCell><Input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))} className="h-8" /></TableCell>
                                <TableCell><Input type="number" value={item.cost} onChange={e => handleItemChange(item.id, 'cost', parseFloat(e.target.value))} className="h-8" /></TableCell>
                                <TableCell className="font-mono">${(item.quantity * item.cost).toFixed(2)}</TableCell>
                                <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className="p-2">
                    <Button variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />Add Ingredient</Button>
                </div>
            </CardContent>
            <CardFooter className="bg-muted p-2 rounded-b-lg flex justify-end font-bold font-mono">
                Total: ${subtotal.toFixed(2)}
            </CardFooter>
        </Card>
    );
};

const UtilityCostTable = ({ items, setItems }: { items: UtilityCost[], setItems: React.Dispatch<React.SetStateAction<UtilityCost[]>> }) => {
    const handleItemChange = (id: string, field: keyof UtilityCost, value: string | number) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => setItems(prev => [...prev, createNewUtilityCost()]);
    const removeItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));
    
    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.cost, 0), [items]);

    return (
         <Card>
            <CardHeader className="bg-destructive/80 text-destructive-foreground p-2 rounded-t-lg">
                <CardTitle className="text-base">Utility and Prep. Cost</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-3/4">Name</TableHead>
                            <TableHead>Total Cost</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell><Input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="h-8" /></TableCell>
                                <TableCell><Input type="number" value={item.cost} onChange={e => handleItemChange(item.id, 'cost', parseFloat(e.target.value))} className="h-8" /></TableCell>
                                <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="p-2">
                    <Button variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />Add Cost</Button>
                </div>
            </CardContent>
            <CardFooter className="bg-destructive/80 text-destructive-foreground p-2 rounded-b-lg flex justify-end font-bold font-mono">
                Total: ${subtotal.toFixed(2)}
            </CardFooter>
        </Card>
    );
}

export default function FoodCostPage() {
    const [dishName, setDishName] = useLocalStorage('foodcost:dishName', 'My New Dish');
    const [date, setDate] = useLocalStorage('foodcost:date', new Date().toISOString().split('T')[0]);
    const [estSalePrice, setEstSalePrice] = useLocalStorage('foodcost:estSalePrice', 0);

    const [primaryIngredients, setPrimaryIngredients] = useLocalStorage<Ingredient[]>('foodcost:primary', [createNewIngredient()]);
    const [secondaryIngredients, setSecondaryIngredients] = useLocalStorage<Ingredient[]>('foodcost:secondary', [createNewIngredient()]);
    const [utilityCosts, setUtilityCosts] = useLocalStorage<UtilityCost[]>('foodcost:utility', [createNewUtilityCost()]);
    const [photoUrl, setPhotoUrl] = useLocalStorage('foodcost:photoUrl', '');
    const [preparation, setPreparation] = useLocalStorage('foodcost:preparation', '');
    const [allergies, setAllergies] = useLocalStorage('foodcost:allergies', '');

    const { totalPrimary, totalSecondary, totalUtility, totalCost, costMargin, netProfit, chartData } = useMemo(() => {
        const totalPrimary = primaryIngredients.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        const totalSecondary = secondaryIngredients.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        const totalUtility = utilityCosts.reduce((sum, item) => sum + item.cost, 0);
        const totalCost = totalPrimary + totalSecondary + totalUtility;
        const costMargin = estSalePrice > 0 ? (totalCost / estSalePrice) * 100 : 0;
        const netProfit = estSalePrice - totalCost;

        const chartData = [
            { name: 'Primary', value: totalPrimary, fill: 'hsl(var(--chart-2))' },
            { name: 'Secondary', value: totalSecondary, fill: 'hsl(var(--chart-3))' },
            { name: 'Utility', value: totalUtility, fill: 'hsl(var(--chart-5))' }
        ].filter(item => item.value > 0);

        return { totalPrimary, totalSecondary, totalUtility, totalCost, costMargin, netProfit, chartData };
    }, [primaryIngredients, secondaryIngredients, utilityCosts, estSalePrice]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 md:p-8 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Recipe Cost Calculator</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label>Date</Label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                             <div className="grid grid-cols-2 items-center gap-2">
                                <Label>Dish Name</Label>
                                <Input value={dishName} onChange={e => setDishName(e.target.value)} />
                            </div>
                             <div className="grid grid-cols-2 items-center gap-2">
                                <Label>Est. Sale Price</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" value={estSalePrice} onChange={e => setEstSalePrice(parseFloat(e.target.value) || 0)} className="pl-8"/>
                                </div>
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between font-medium"><span>Total Cost</span><span className="font-mono">${totalCost.toFixed(2)}</span></div>
                                <div className="flex justify-between font-medium"><span>Cost Margin</span><span className="font-mono">{costMargin.toFixed(2)}%</span></div>
                                <div className="flex justify-between font-bold text-lg"><span>Net Profit</span><span className="font-mono">${netProfit.toFixed(2)}</span></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-center">Cost Distribution</h4>
                             <ChartContainer config={{}} className="h-48 w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                           {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                    <div className="space-y-6">
                        <IngredientTable title="Primary Ingredients" items={primaryIngredients} setItems={setPrimaryIngredients} />
                        <IngredientTable title="Secondary Ingredients" items={secondaryIngredients} setItems={setSecondaryIngredients} />
                        <UtilityCostTable items={utilityCosts} setItems={setUtilityCosts} />
                        <Card>
                             <CardHeader className="bg-muted p-2 rounded-t-lg"><CardTitle className="text-base">Allergies</CardTitle></CardHeader>
                             <CardContent className="p-2"><Textarea value={allergies} onChange={e => setAllergies(e.target.value)} rows={3} /></CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                         <Card>
                            <CardHeader className="bg-muted p-2 rounded-t-lg"><CardTitle className="text-base">Photo of the Dish</CardTitle></CardHeader>
                            <CardContent className="p-4 flex flex-col items-center justify-center">
                               {photoUrl ? (
                                    <div className="relative w-full aspect-square"><Image src={photoUrl} alt={dishName} layout="fill" objectFit="cover" className="rounded-md"/></div>
                               ) : (
                                    <div className="w-full aspect-square bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground">
                                        <p>No Image</p>
                                    </div>
                               )}
                               <Input type="file" onChange={handleImageUpload} accept="image/*" className="mt-2"/>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="bg-muted p-2 rounded-t-lg"><CardTitle className="text-base">Preparation</CardTitle></CardHeader>
                            <CardContent className="p-2"><Textarea value={preparation} onChange={e => setPreparation(e.target.value)} rows={10} /></CardContent>
                        </Card>
                    </div>
                </div>
                 <CardFooter className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Input placeholder="Prepared By" />
                        <Input placeholder="Occupation" />
                    </div>
                    <div className="space-y-1">
                        <Input placeholder="Approved By" />
                        <Input placeholder="Occupation" />
                    </div>
                </CardFooter>
            </div>
        </ScrollArea>
    );
}
