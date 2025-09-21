'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '../ui/button';

// Conversion factors relative to a base unit (e.g., grams for weight, ml for volume)
const conversions = {
    weight: {
        gram: 1,
        kilogram: 1000,
        ounce: 28.35,
        pound: 453.592,
    },
    volume: {
        milliliter: 1,
        liter: 1000,
        'fluid ounce': 29.5735,
        teaspoon: 4.92892,
        tablespoon: 14.7868,
        cup: 236.588,
    },
    temperature: {
        celsius: { toBase: (c: number) => c, fromBase: (b: number) => b },
        fahrenheit: { toBase: (f: number) => (f - 32) * 5 / 9, fromBase: (b: number) => (b * 9 / 5) + 32 },
        kelvin: { toBase: (k: number) => k - 273.15, fromBase: (b: number) => b + 273.15 },
    }
};

const unitTypes = [
    { value: 'weight', label: 'Weight', units: Object.keys(conversions.weight) },
    { value: 'volume', label: 'Volume', units: Object.keys(conversions.volume) },
    { value: 'temperature', label: 'Temperature', units: Object.keys(conversions.temperature) },
];

export function UnitConverter() {
    const [unitType, setUnitType] = useState('weight');
    const [fromUnit, setFromUnit] = useState('gram');
    const [toUnit, setToUnit] = useState('ounce');
    const [fromValue, setFromValue] = useState<string>('1');
    
    const handleUnitTypeChange = (type: string) => {
        setUnitType(type);
        const newUnits = unitTypes.find(t => t.value === type)?.units || [];
        setFromUnit(newUnits[0]);
        setToUnit(newUnits[1] || newUnits[0]);
        setFromValue('1');
    };

    const toValue = useMemo(() => {
        const value = parseFloat(fromValue);
        if (isNaN(value)) return '';

        if (unitType === 'temperature') {
            const tempConversions = conversions.temperature as any;
            const toBase = tempConversions[fromUnit].toBase;
            const fromBase = tempConversions[toUnit].fromBase;
            return fromBase(toBase(value)).toFixed(2);
        } else {
            const typeConversions = conversions[unitType as 'weight' | 'volume'] as any;
            const fromFactor = typeConversions[fromUnit];
            const toFactor = typeConversions[toUnit];
            if (fromFactor && toFactor) {
                const baseValue = value * fromFactor;
                return (baseValue / toFactor).toFixed(4);
            }
        }
        return '';
    }, [fromValue, fromUnit, toUnit, unitType]);
    
    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    }

    const currentUnits = unitTypes.find(t => t.value === unitType)?.units || [];

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle>Unit Conversion Tool</CardTitle>
                    <CardDescription>A simple tool to convert between common culinary measurements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Measurement Type</Label>
                        <Select value={unitType} onValueChange={handleUnitTypeChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {unitTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-4">
                        <div className="space-y-2">
                            <Label>From</Label>
                            <Input
                                type="number"
                                value={fromValue}
                                onChange={(e) => setFromValue(e.target.value)}
                                className="text-lg h-12"
                            />
                            <Select value={fromUnit} onValueChange={setFromUnit}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {currentUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button variant="ghost" size="icon" onClick={swapUnits} className="hidden md:flex">
                          <ArrowRightLeft />
                        </Button>

                        <div className="space-y-2">
                            <Label>To</Label>
                            <Input
                                type="text"
                                value={toValue}
                                readOnly
                                className="text-lg h-12 bg-muted font-semibold"
                            />
                             <Select value={toUnit} onValueChange={setToUnit}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                     {currentUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
