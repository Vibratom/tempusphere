
'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

interface WaterfallDataPoint {
    name: string;
    range: [number, number];
    isTotal: boolean;
    fill: string;
    label?: string;
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

        if (totalIncome > 0) {
            data.push({
                name: 'Revenue',
                range: [0, totalIncome],
                isTotal: false,
                fill: 'hsl(var(--chart-2))',
                label: `$${totalIncome.toLocaleString()}`,
            });
            runningTotal = totalIncome;

            // Optional: Add a Total Revenue bar if you want to show it explicitly
            data.push({
                name: 'Total Revenue',
                range: [0, runningTotal],
                isTotal: true,
                fill: 'hsl(var(--muted-foreground))',
                label: `$${runningTotal.toLocaleString()}`,
            });
        }
        
        // 3. Expenses (grouped)
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        if (totalExpenses > 0) {
            const newTotal = runningTotal - totalExpenses;
            data.push({
                name: 'Expenses',
                range: [newTotal, runningTotal], // This creates the floating bar
                isTotal: false,
                fill: 'hsl(var(--chart-5))',
                label: `-$${totalExpenses.toLocaleString()}`,
            });
            runningTotal = newTotal;
        }
        
        // 4. Net Income (as a total bar)
        data.push({
            name: 'Net Income',
            range: [0, runningTotal],
            isTotal: true,
            fill: 'hsl(var(--muted-foreground))',
            label: `$${runningTotal.toLocaleString()}`,
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
                                const payload = props.payload as any;
                                const actualValue = name === 'End' ? payload.range[1] : payload.range[1] - payload.range[0];
                                return (
                                    <div className="flex flex-col">
                                        <span className="font-bold">{payload.name}</span>
                                        <span>{`$${Number(actualValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</span>
                                    </div>
                                )
                            }}
                            hideLabel 
                        />}
                    />
                    {/* Transparent base bar */}
                    <Bar dataKey="range[0]" stackId="a" fill="transparent" />
                    
                    {/* Visible value bar */}
                    <Bar dataKey={(d: WaterfallDataPoint) => d.range[1] - d.range[0]} stackId="a">
                       <LabelList 
                            dataKey="label"
                            position="top" 
                            offset={10}
                            className="fill-foreground text-sm font-medium"
                        />
                         {waterfallData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
