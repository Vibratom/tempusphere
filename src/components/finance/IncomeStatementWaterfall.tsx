
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

    const waterfallData = useMemo(() => {
        let cumulative = 0;
        const data: WaterfallDataPoint[] = [];

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        if (totalIncome > 0) {
            data.push({
                name: 'Revenue',
                value: totalIncome,
                start: 0,
                end: totalIncome,
                fill: 'hsl(var(--chart-2))',
                label: `$${totalIncome.toLocaleString()}`
            });
            cumulative = totalIncome;
        }

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        if (totalExpenses > 0) {
             data.push({
                name: 'Expenses',
                value: -totalExpenses,
                start: cumulative - totalExpenses,
                end: cumulative,
                fill: 'hsl(var(--chart-5))',
                label: `-$${totalExpenses.toLocaleString()}`
            });
            cumulative -= totalExpenses;
        }

        data.push({
            name: 'Net Income',
            value: cumulative,
            start: 0,
            end: cumulative,
            fill: 'hsl(var(--muted-foreground))',
            label: `$${cumulative.toLocaleString()}`
        });

        return data;
    }, [transactions]);
    
    if (!waterfallData) return <Skeleton className="h-80 w-full" />;
    
    const renderCustomizedLabel = (props: any) => {
        const { x, y, width, value } = props;
        const radius = 10;
        const isNegative = value < 0;

        return (
            <g>
            <text x={x + width / 2} y={isNegative ? y - radius : y + radius} fill="#666" textAnchor="middle" dominantBaseline={isNegative ? "bottom" : "hanging"}>
                {value.toLocaleString()}
            </text>
            </g>
        );
    };

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
                                const actualValue = payload.value;
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
                       <LabelList 
                            dataKey="label"
                            position="top" 
                            offset={10}
                            className="fill-foreground text-sm font-medium"
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
