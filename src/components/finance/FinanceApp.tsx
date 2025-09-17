
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectsContext';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Legend, Cell, Tooltip, BarChart, XAxis, YAxis, Bar, CartesianGrid } from 'recharts';
import { Skeleton } from '../ui/skeleton';
import { format, startOfMonth, subMonths } from 'date-fns';

const COLORS = ['#16a34a', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#d946ef', '#14b8a6', '#eab308'];

export function FinanceApp() {
    const { transactions } = useFinance();
    const { board } = useProjects();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const financialSummary = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpense += t.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [transactions]);
    
    const { accountsReceivable, accountsPayable } = useMemo(() => {
        const ar = transactions.filter(t => t.type === 'income' && t.status !== 'paid');
        const ap = transactions.filter(t => t.type === 'expense' && t.status !== 'paid');
        return { accountsReceivable: ar, accountsPayable: ap };
    }, [transactions]);

    const expenseByCategory = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const byCategory = expenses.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = { name: t.category, value: 0 };
            }
            acc[t.category].value += t.amount;
            return acc;
        }, {} as Record<string, {name: string, value: number}>);
        return Object.values(byCategory);
    }, [transactions]);

    const monthlyTrends = useMemo(() => {
        const now = new Date();
        const data: Record<string, { name: string, income: number, expense: number }> = {};

        for (let i = 5; i >= 0; i--) {
            const month = subMonths(now, i);
            const monthKey = format(month, 'MMM yy');
            data[monthKey] = { name: monthKey, income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            const monthKey = format(new Date(t.date), 'MMM yy');
            if (data[monthKey]) {
                if (t.type === 'income') {
                    data[monthKey].income += t.amount;
                } else {
                    data[monthKey].expense += t.amount;
                }
            }
        });
        
        return Object.values(data);
    }, [transactions]);
    
    return (
        <div className="w-full flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ArrowUp className="text-green-500"/> Total Income</CardTitle></CardHeader>
                    <CardContent>
                        {isClient ? <p className="text-3xl font-bold text-green-500">${financialSummary.totalIncome.toFixed(2)}</p> : <Skeleton className="h-9 w-32" />}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ArrowDown className="text-red-500"/> Total Expenses</CardTitle></CardHeader>
                    <CardContent>
                        {isClient ? <p className="text-3xl font-bold text-red-500">${financialSummary.totalExpense.toFixed(2)}</p> : <Skeleton className="h-9 w-32" />}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Net Balance</CardTitle></CardHeader>
                    <CardContent>
                        {isClient ? <p className="text-3xl font-bold">${(financialSummary.totalIncome - financialSummary.totalExpense).toFixed(2)}</p> : <Skeleton className="h-9 w-32" />}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>A/P vs A/R</CardTitle></CardHeader>
                    <CardContent>
                        {isClient ? (
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Receivable</p>
                                <p className="text-lg font-bold text-green-500">${accountsReceivable.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                            </div>
                             <div className="text-center">
                                <p className="text-sm text-muted-foreground">Payable</p>
                                <p className="text-lg font-bold text-red-500">${accountsPayable.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                            </div>
                        </div>
                        ) : <Skeleton className="h-9 w-full" />}
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Monthly Income vs. Expense</CardTitle>
                    <CardDescription>Trends over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-64 w-full">
                         <ResponsiveContainer>
                            <BarChart data={monthlyTrends}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend iconType="circle" />
                                <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-64 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Tooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                     {expenseByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
