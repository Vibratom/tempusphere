'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

interface WaterfallDataPoint {
    name: string;
    value: number; 
    base?: number;
    isTotal?: boolean;
    fill: string;
}

export function IncomeStatementWaterfall() {
    const { transactions } = useFinance();

    const waterfallData = useMemo(() => {
        const data: WaterfallDataPoint[] = [];
        let runningTotal = 0;

        // 1. Revenue
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        data.push({
            name: 'Revenue',
            value: totalIncome,
            base: 0,
            fill: 'hsl(var(--chart-2))', // Green
        });
        runningTotal = totalIncome;

        // 2. Total Revenue (Intermediate Sum)
        data.push({
            name: 'Total Revenue',
            value: runningTotal,
            isTotal: true,
            fill: 'hsl(var(--chart-2))',
        });

        // 3. Expenses (grouped)
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        if (totalExpenses > 0) {
            data.push({
                name: 'Expenses',
                value: -totalExpenses, // Negative value
                base: runningTotal,
                fill: 'hsl(var(--chart-5))', // Red
            });
            runningTotal -= totalExpenses;
        }
        
        // 4. Net Income (as a total bar)
        data.push({
            name: 'Net Income',
            value: runningTotal,
            isTotal: true,
            fill: 'hsl(var(--muted-foreground))', // Gray
        });

        return data;
    }, [transactions]);
    
    if (!waterfallData) return <Skeleton className="h-80 w-full" />;
    
    return (
        <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
                <BarChart data={waterfallData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }} 
                        content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                const payload = props.payload as WaterfallDataPoint;
                                let displayValue = payload.value;
                                
                                return (
                                    <div className="flex flex-col">
                                        <span className="font-bold">{payload.name}</span>
                                        <span>{`$${Number(displayValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</span>
                                    </div>
                                )
                            }}
                            hideLabel 
                        />}
                    />
                    {/* This bar is for the floating segments */}
                    <Bar dataKey="base" stackId="a" fill="transparent" />
                    
                    {/* This bar is for the actual value */}
                    <Bar dataKey="value" stackId="a">
                       <LabelList 
                            dataKey="value"
                            position="top" 
                            offset={10}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                            className="fill-foreground text-sm font-medium"
                        />
                         {waterfallData.map((entry, index) => {
                            // Total bars should not float, they start from 0.
                            // We can achieve this by overriding the `base` for them if it exists.
                            const barValue = entry.isTotal ? entry.value : entry.value;
                            const barBase = entry.isTotal ? 0 : (entry.base ?? 0) - (entry.value < 0 ? entry.value : 0)

                            return (
                               <Cell key={`cell-${index}`} fill={entry.fill} />
                           )
                         })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
