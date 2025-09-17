
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, startOfMonth, endOfMonth, subDays, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


type DateRange = 'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'all_time';

const COLORS = ['#16a34a', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#d946ef', '#14b8a6', '#eab308'];


const getDateRange = (range: DateRange): { start: Date, end: Date } | null => {
    const today = new Date();
    switch(range) {
        case 'this_month':
            return { start: startOfMonth(today), end: endOfMonth(today) };
        case 'last_month':
            const lastMonth = subMonths(today, 1);
            return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
        case 'last_90_days':
            return { start: subDays(today, 90), end: today };
        case 'this_year':
            return { start: startOfYear(today), end: endOfYear(today) };
        case 'all_time':
            return null;
        default:
            return { start: startOfMonth(today), end: endOfMonth(today) };
    }
}

export function FinancialReports() {
    const { transactions } = useFinance();
    const [dateRange, setDateRange] = useState<DateRange>('this_month');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredTransactions = useMemo(() => {
        const range = getDateRange(dateRange);
        if (!range) return transactions;
        return transactions.filter(t => {
            const tDate = parseISO(t.date);
            return tDate >= range.start && tDate <= range.end;
        });
    }, [transactions, dateRange]);

    const incomeStatement = useMemo(() => {
        const incomeByCategory: Record<string, number> = {};
        const expensesByCategory: Record<string, number> = {};
        let totalIncome = 0;
        let totalExpenses = 0;

        filteredTransactions.forEach(t => {
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
    }, [filteredTransactions]);

    const cashFlowStatement = useMemo(() => {
        let cashIn = 0;
        let cashOut = 0;
        
        filteredTransactions.forEach(t => {
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
    }, [filteredTransactions]);
    
    const balanceSheet = useMemo(() => {
        const accountsReceivable = filteredTransactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const accountsPayable = filteredTransactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const equity = incomeStatement.netIncome;
        
        const chartData = [
            { name: 'Assets', value: accountsReceivable, fill: 'hsl(var(--chart-2))' },
            { name: 'Liabilities & Equity', value: accountsPayable + equity, fill: 'hsl(var(--chart-5))' },
        ]

        return {
            totalAssets: accountsReceivable,
            totalLiabilities: accountsPayable,
            equity,
            totalLiabilitiesAndEquity: accountsPayable + equity,
            chartData
        }
    }, [filteredTransactions, incomeStatement]);

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                         <div>
                            <CardTitle>Financial Reports</CardTitle>
                            <CardDescription>Income Statement, Cash Flow, and Balance Sheet.</CardDescription>
                         </div>
                         <div className="w-48">
                            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_month">Last Month</SelectItem>
                                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="all_time">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                </CardHeader>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Income Statement</CardTitle>
                    <CardDescription>A summary of revenues and expenses over the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Income</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {Object.entries(incomeStatement.incomeByCategory).map(([cat, amt]) => (
                                <TableRow key={`inc-${cat}`}><TableCell className="pl-6">{cat}</TableCell><TableCell className="text-right font-mono">${amt.toFixed(2)}</TableCell></TableRow>
                            ))}
                            <TableRow className="font-semibold border-t">
                                <TableCell className="pl-4">Total Income</TableCell>
                                <TableCell className="text-right font-mono text-green-500">${incomeStatement.totalIncome.toFixed(2)}</TableCell>
                            </TableRow>
                            
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Expenses</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                             {Object.entries(incomeStatement.expensesByCategory).map(([cat, amt]) => (
                                <TableRow key={`exp-${cat}`}><TableCell className="pl-6">{cat}</TableCell><TableCell className="text-right font-mono">${amt.toFixed(2)}</TableCell></TableRow>
                            ))}
                            <TableRow className="font-semibold border-t">
                                <TableCell className="pl-4">Total Expenses</TableCell>
                                <TableCell className="text-right font-mono text-red-500">${incomeStatement.totalExpenses.toFixed(2)}</TableCell>
                            </TableRow>

                            <TableRow className="font-bold text-lg bg-muted border-t-2 border-border">
                                <TableCell>Net Income</TableCell>
                                <TableCell className="text-right font-mono">${incomeStatement.netIncome.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="grid grid-rows-2 gap-4">
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
                        <CardTitle>Cash Flow Statement</CardTitle>
                        <CardDescription>Movement of cash from paid transactions.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="flex items-center gap-2"><ArrowUp className="text-green-500"/> Cash Inflows</TableCell>
                                    <TableCell className="text-right font-mono text-green-500">+${cashFlowStatement.cashIn.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="flex items-center gap-2"><ArrowDown className="text-red-500"/> Cash Outflows</TableCell>
                                    <TableCell className="text-right font-mono text-red-500">-${cashFlowStatement.cashOut.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow className="font-bold text-lg bg-muted border-t-2 border-border">
                                    <TableCell>Net Cash Flow</TableCell>
                                    <TableCell className="text-right font-mono">${cashFlowStatement.netCashFlow.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                            </Table>
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
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Balance Sheet (Simplified)</CardTitle>
                        <CardDescription>A snapshot of assets and liabilities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Table>
                                <TableBody>
                                    <TableRow className="font-bold bg-muted/50"><TableCell>Assets</TableCell><TableCell></TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Accounts Receivable</TableCell><TableCell className="text-right font-mono">${balanceSheet.totalAssets.toFixed(2)}</TableCell></TableRow>
                                    <TableRow className="font-semibold border-t"><TableCell className="pl-4">Total Assets</TableCell><TableCell className="text-right font-mono text-green-500">${balanceSheet.totalAssets.toFixed(2)}</TableCell></TableRow>
                                    
                                    <TableRow className="font-bold bg-muted/50"><TableCell>Liabilities & Equity</TableCell><TableCell></TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Accounts Payable</TableCell><TableCell className="text-right font-mono">${balanceSheet.totalLiabilities.toFixed(2)}</TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Retained Earnings (Net Income)</TableCell><TableCell className="text-right font-mono">${balanceSheet.equity.toFixed(2)}</TableCell></TableRow>
                                    <TableRow className="font-semibold border-t"><TableCell className="pl-4">Total Liabilities & Equity</TableCell><TableCell className="text-right font-mono text-red-500">${balanceSheet.totalLiabilitiesAndEquity.toFixed(2)}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                             <ChartContainer config={{}} className="h-48 w-full">
                                <ResponsiveContainer>
                                    <BarChart data={balanceSheet.chartData} layout="vertical" margin={{ left: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" hide />
                                        <Tooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                                        <Bar dataKey="value" radius={5}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    