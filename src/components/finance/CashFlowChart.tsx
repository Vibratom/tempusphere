
'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, Label, ReferenceLine, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

const INVESTING_CATEGORIES = ['Investment Gain'];
const FINANCING_EXPENSE_CATEGORIES = ['Interest Expense'];
const FINANCING_INCOME_CATEGORIES = ['Loan'];

export function CashFlowChart() {
    const { transactions } = useFinance();

    const chartData = useMemo(() => {
        const netIncome = transactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        const accountsPayableChange = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.status !== 'paid' ? t.amount : 0), 0);

        const accountsReceivableChange = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.status !== 'paid' ? -t.amount : 0), 0);
        
        const cashFromOperating = netIncome + accountsReceivableChange + accountsPayableChange;
            
        const investments = transactions
            .filter(t => t.status === 'paid' && INVESTING_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
            
        const cashFromInvesting = investments;

        const debtIssued = transactions
            .filter(t => t.status === 'paid' && FINANCING_INCOME_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const debtRepaid = transactions
            .filter(t => t.status === 'paid' && FINANCING_EXPENSE_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const cashFromFinancing = debtIssued - debtRepaid;

        const netCashFlow = cashFromOperating + cashFromInvesting + cashFromFinancing;

        let cumulative = 0;
        return [
            { name: 'Operating', value: cashFromOperating, offset: 0, fill: 'hsl(var(--chart-2))'},
            { name: 'Investing', value: cashFromInvesting, offset: cumulative += cashFromOperating, fill: 'hsl(var(--chart-3))'},
            { name: 'Financing', value: cashFromFinancing, offset: cumulative += cashFromInvesting, fill: 'hsl(var(--chart-4))'},
            { name: 'Net Change', value: netCashFlow, offset: 0, fill: 'hsl(var(--foreground))'},
        ].map(item => ({...item, range: [item.offset, item.offset + item.value] }));

    }, [transactions]);
    
    if (!chartData) return <Skeleton className="h-80 w-full" />;

    return (
        <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
                <BarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent hideLabel />} />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                    <Bar dataKey="range">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
