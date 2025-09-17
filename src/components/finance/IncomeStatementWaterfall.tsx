'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

export function IncomeStatementWaterfall() {
    const { transactions } = useFinance();

    const chartData = useMemo(() => {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netIncome = totalIncome - totalExpenses;

        return [
            { name: 'Revenue', value: totalIncome, fill: 'hsl(var(--chart-2))', label: `$${totalIncome.toLocaleString()}` },
            { name: 'Expenses', value: totalExpenses, fill: 'hsl(var(--chart-5))', label: `-$${totalExpenses.toLocaleString()}` },
            { name: 'Net Income', value: netIncome, fill: 'hsl(var(--foreground))', label: `$${netIncome.toLocaleString()}` },
        ];
    }, [transactions]);
    
    if (!chartData) return <Skeleton className="h-80 w-full" />;

    return (
        <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name" 
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                    />
                     <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }} 
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       <LabelList 
                            dataKey="label"
                            position="top" 
                            offset={8}
                            className="fill-foreground text-sm font-medium"
                        />
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
