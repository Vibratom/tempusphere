
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectsContext';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Legend, Cell, Tooltip, BarChart, XAxis, YAxis, Bar, CartesianGrid } from 'recharts';
import { Skeleton } from '../ui/skeleton';
import { format, startOfMonth, subMonths, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

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
    
    const incomeStatement = useMemo(() => {
        const incomeByCategory: Record<string, number> = {};
        const expensesByCategory: Record<string, number> = {};
        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            } else {
                totalExpenses += t.amount;
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            }
        });
        
        const incomeChartData = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
        const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));


        return { 
            incomeByCategory, 
            totalIncome,
            expensesByCategory,
            totalExpenses,
            netIncome: totalIncome - totalExpenses,
            incomeChartData,
            expenseChartData
        };
    }, [transactions]);

    const cashFlowStatement = useMemo(() => {
        let cashIn = 0;
        let cashOut = 0;
        
        transactions.forEach(t => {
            if (t.status === 'paid') {
                if (t.type === 'income') cashIn += t.amount;
                else cashOut += t.amount;
            }
        });

        const chartData = [
            { name: 'Cash Inflows', value: cashIn, fill: 'hsl(var(--chart-2))' },
            { name: 'Cash Outflows', value: cashOut, fill: 'hsl(var(--chart-5))' },
        ];

        return { cashIn, cashOut, netCashFlow: cashIn - cashOut, chartData };
    }, [transactions]);
    
    const balanceSheet = useMemo(() => {
        const ar = transactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const ap = transactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const equity = incomeStatement.netIncome;
        
        const chartData = [
            { name: 'Assets', value: ar, fill: 'hsl(var(--chart-2))' },
            { name: 'Liabilities & Equity', value: ap + equity, fill: 'hsl(var(--chart-5))' },
        ]

        return {
            totalAssets: ar,
            totalLiabilities: ap,
            equity,
            totalLiabilitiesAndEquity: ap + equity,
            chartData
        }
    }, [transactions, incomeStatement]);


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
                    <CardTitle>Income vs Expense Breakdown</CardTitle>
                    <CardDescription>Spending and earnings by category (all time)</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="flex flex-col gap-4">
                        <h4 className="text-center font-semibold">Income Sources</h4>
                        <ChartContainer config={{}} className="h-48 w-full">
                             <ResponsiveContainer>
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={incomeStatement.incomeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                                        {incomeStatement.incomeChartData.map((entry, index) => (
                                            <Cell key={`cell-inc-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                     <div className="flex flex-col gap-4">
                        <h4 className="text-center font-semibold">Expense Categories</h4>
                        <ChartContainer config={{}} className="h-48 w-full">
                             <ResponsiveContainer>
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={incomeStatement.expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                                        {incomeStatement.expenseChartData.map((entry, index) => (
                                            <Cell key={`cell-exp-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Cash Flow</CardTitle>
                        <CardDescription>Movement of cash from paid transactions.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <ChartContainer config={{}} className="h-40 w-full">
                            <ResponsiveContainer>
                                <BarChart data={cashFlowStatement.chartData} layout="vertical" margin={{ left: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" hide />
                                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                                    <Bar dataKey="value" radius={5}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Balance Sheet (Simplified)</CardTitle>
                        <CardDescription>Snapshot of assets and liabilities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={{}} className="h-40 w-full">
                            <ResponsiveContainer>
                                <BarChart data={balanceSheet.chartData} layout="vertical" margin={{ left: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" hide />
                                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                                    <Bar dataKey="value" radius={5}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    