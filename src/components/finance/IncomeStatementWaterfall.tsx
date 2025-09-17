
'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

interface WaterfallDataPoint {
    name: string;
    value: number;
    start: number;
    end: number;
    fill: string;
    label: string;
}

export function IncomeStatementWaterfall() {
    const { transactions } = useFinance();

    const chartData = useMemo(() => {
        let cumulative = 0;
        const data: { name: string, start: number, value: number, fill: string, label: string }[] = [];

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        if (totalIncome > 0) {
            data.push({
                name: 'Revenue',
                start: 0,
                value: totalIncome,
                fill: 'hsl(var(--chart-2))',
                label: `$${totalIncome.toLocaleString()}`,
            });
            cumulative = totalIncome;
        }

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        if (totalExpenses > 0) {
             data.push({
                name: 'Expenses',
                start: cumulative - totalExpenses,
                value: totalExpenses,
                fill: 'hsl(var(--chart-5))',
                label: `-$${totalExpenses.toLocaleString()}`,
            });
            cumulative -= totalExpenses;
        }

        data.push({
            name: 'Net Income',
            start: 0,
            value: cumulative,
            fill: 'hsl(var(--muted-foreground))',
            label: `$${cumulative.toLocaleString()}`
        });

        return data;
    }, [transactions]);
    
    if (!chartData) return <Skeleton className="h-80 w-full" />;

    return (
        <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                     <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }} 
                        content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                const payload = props.payload as any;
                                let actualValue = payload.value;
                                if (payload.name === 'Expenses') {
                                    actualValue = -actualValue;
                                }
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
                    <Bar dataKey="start" stackId="a" fill="transparent" />
                    <Bar dataKey="value" stackId="a">
                       {chartData.map((entry, index) => (
                         <LabelList 
                            key={`label-${index}`}
                            dataKey="label"
                            position="top" 
                            offset={10}
                            className="fill-foreground text-sm font-medium"
                            content={(props) => {
                                const { x, y, width, value, index } = props;
                                const dataPoint = chartData[index as number];
                                return (
                                    <text x={x! + width! / 2} y={y} dy={-10} textAnchor="middle" fill={dataPoint.fill}>
                                        {dataPoint.label}
                                    </text>
                                )
                            }}
                        />
                       ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
