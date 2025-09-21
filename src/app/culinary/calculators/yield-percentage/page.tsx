'use client';

import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FinishedUnit {
    id: string;
    name: string;
    qty: number;
    unitWeightValue: number;
    unitWeightUnit: 'oz' | 'lb' | 'g' | 'kg';
}

const createNewFinishedUnit = (): FinishedUnit => ({
    id: uuidv4(),
    name: '',
    qty: 0,
    unitWeightValue: 0,
    unitWeightUnit: 'oz',
});

const unitConversionToLb: Record<FinishedUnit['unitWeightUnit'], number> = {
    oz: 1 / 16,
    lb: 1,
    g: 0.00220462,
    kg: 2.20462,
};

const unitOptions: FinishedUnit['unitWeightUnit'][] = ['oz', 'lb', 'g', 'kg'];

export default function YieldCalculatorPage() {
    const [rawProduct, setRawProduct] = useLocalStorage('yield:rawProduct', 'Striploin');
    const [date, setDate] = useLocalStorage('yield:date', new Date().toISOString().split('T')[0]);
    const [beginningWeight, setBeginningWeight] = useLocalStorage('yield:beginningWeight', 10);
    const [rawCostPerLb, setRawCostPerLb] = useLocalStorage('yield:rawCostPerLb', 5);
    const [finishedUnits, setFinishedUnits] = useLocalStorage<FinishedUnit[]>('yield:finishedUnits', [
        { id: uuidv4(), name: '8oz Steaks', qty: 5, unitWeightValue: 8, unitWeightUnit: 'oz' },
        { id: uuidv4(), name: '16oz Steaks', qty: 6, unitWeightValue: 16, unitWeightUnit: 'oz' },
        { id: uuidv4(), name: 'Kabob Scrap', qty: 20, unitWeightValue: 1, unitWeightUnit: 'oz' },
        createNewFinishedUnit(),
        createNewFinishedUnit(),
    ]);

    const handleUnitChange = (id: string, field: keyof FinishedUnit, value: string | number) => {
        setFinishedUnits(prev => prev.map(unit => unit.id === id ? { ...unit, [field]: value } : unit));
    };

    const addUnit = () => setFinishedUnits(prev => [...prev, createNewFinishedUnit()]);
    const removeUnit = (id: string) => setFinishedUnits(prev => prev.filter(unit => unit.id !== id));

    const calculations = useMemo(() => {
        const totalCost = beginningWeight * rawCostPerLb;

        const unitCalcs = finishedUnits.map(unit => {
            const unitWeightInLbs = unit.unitWeightValue * unitConversionToLb[unit.unitWeightUnit];
            const finishedWeight = unit.qty * unitWeightInLbs;
            return {
                ...unit,
                unitWeightInLbs,
                finishedWeight
            };
        });
        
        const usableProductWeight = unitCalcs.reduce((sum, unit) => sum + unit.finishedWeight, 0);
        const scrapWeight = beginningWeight - usableProductWeight;
        const yieldPercentage = beginningWeight > 0 ? (usableProductWeight / beginningWeight) * 100 : 0;
        const scrapPercentage = beginningWeight > 0 ? (scrapWeight / beginningWeight) * 100 : 0;
        const yieldCostPerLb = usableProductWeight > 0 ? totalCost / usableProductWeight : 0;

        const finalUnitCalcs = unitCalcs.map(unit => ({
            ...unit,
            unitCost: yieldCostPerLb * unit.unitWeightInLbs,
        }));
        
        return {
            totalCost,
            yieldCostPerLb,
            usableProductWeight,
            scrapWeight,
            yieldPercentage,
            scrapPercentage,
            units: finalUnitCalcs,
        };

    }, [beginningWeight, rawCostPerLb, finishedUnits]);

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Yield Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                            <Label>Raw Product</Label>
                            <Input value={rawProduct} onChange={e => setRawProduct(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                                <Label>Raw cost per lb</Label>
                                <div className="relative w-24">
                                     <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" value={rawCostPerLb} onChange={e => setRawCostPerLb(Number(e.target.value))} className="pl-8 text-right"/>
                                </div>
                           </div>
                             <div className="flex items-center justify-end gap-2">
                                <Label>Yield cost per lb</Label>
                                <div className="relative w-24">
                                     <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                     <Input value={calculations.yieldCostPerLb.toFixed(2)} readOnly className="pl-8 font-bold text-right" />
                                </div>
                           </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg">
                         <div className="space-y-2">
                            <Label>Beginning Weight</Label>
                            <div className="flex items-center gap-2">
                                <Input type="number" value={beginningWeight} onChange={e => setBeginningWeight(Number(e.target.value))} />
                                <span className="font-semibold">lb.</span>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Total Cost</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={calculations.totalCost.toFixed(2)} readOnly className="pl-8 font-bold" />
                            </div>
                        </div>
                     </div>

                    <div>
                        <Table>
                            <TableHeader className="bg-destructive/80 text-destructive-foreground">
                                <TableRow>
                                    <TableHead className="text-destructive-foreground w-1/3">Finished Unit</TableHead>
                                    <TableHead className="text-destructive-foreground">Qty</TableHead>
                                    <TableHead className="text-destructive-foreground" colSpan={2}>Unit Weight</TableHead>
                                    <TableHead className="text-destructive-foreground text-right">Finished Weight (lb)</TableHead>
                                    <TableHead className="text-destructive-foreground text-right">Unit Cost</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calculations.units.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell><Input value={unit.name} onChange={e => handleUnitChange(unit.id, 'name', e.target.value)} /></TableCell>
                                        <TableCell><Input type="number" value={unit.qty} onChange={e => handleUnitChange(unit.id, 'qty', Number(e.target.value))} className="w-20"/></TableCell>
                                        <TableCell><Input type="number" value={unit.unitWeightValue} onChange={e => handleUnitChange(unit.id, 'unitWeightValue', Number(e.target.value))} className="w-20" /></TableCell>
                                        <TableCell>
                                            <Select value={unit.unitWeightUnit} onValueChange={v => handleUnitChange(unit.id, 'unitWeightUnit', v)}>
                                                <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
                                                <SelectContent>{unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{unit.finishedWeight.toFixed(3)}</TableCell>
                                        <TableCell className="text-right font-mono">${unit.unitCost.toFixed(2)}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeUnit(unit.id)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <div className="p-2">
                            <Button variant="outline" size="sm" onClick={addUnit}><Plus className="mr-2 h-4 w-4" />Add Row</Button>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
                    <div className="w-full space-y-2">
                         <div className="flex justify-between items-center font-semibold">
                            <span>Usable Product Weight</span>
                            <div className="flex gap-4 font-mono">
                                <span>{calculations.usableProductWeight.toFixed(3)} lb</span>
                                <span>{calculations.yieldPercentage.toFixed(1)}%</span>
                            </div>
                         </div>
                         <div className="flex justify-between items-center font-semibold">
                            <span>Scrap/Waste/Shrink</span>
                             <div className="flex gap-4 font-mono">
                                <span>{calculations.scrapWeight.toFixed(3)} lb</span>
                                <span>{calculations.scrapPercentage.toFixed(1)}%</span>
                            </div>
                         </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
