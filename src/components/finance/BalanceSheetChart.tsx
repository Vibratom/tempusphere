
'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

export function BalanceSheetChart() {
    const { transactions } = useFinance();

    const chartData = useMemo(() => {
        const cash = transactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        const receivables = transactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalAssets = cash + receivables;

        const payables = transactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
        const retainedEarnings = transactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        const totalLiabilitiesAndEquity = payables + retainedEarnings;
        
        return [
            { name: 'Assets', value: totalAssets, fill: 'hsl(var(--chart-2))' },
            { name: 'Liabilities + Equity', value: totalLiabilitiesAndEquity, fill: 'hsl(var(--chart-4))' }
        ];
    }, [transactions]);
    
    if (!chartData) return <Skeleton className="h-80 w-full" />;

    return (
        <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       <LabelList 
                            dataKey="value"
                            position="right" 
                            offset={8}
                            className="fill-foreground text-sm font-medium"
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
