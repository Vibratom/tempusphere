
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, startOfMonth, endOfMonth, subDays, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type DateRange = 'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'all_time';

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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

export function FinancialReports() {
    const { transactions, categories } = useFinance();
    const [dateRange, setDateRange] = useState<DateRange>('this_year');
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
        const sales = filteredTransactions
            .filter(t => t.type === 'income' && t.category !== 'Interest Income' && t.category !== 'Investment Gain')
            .reduce((sum, t) => sum + t.amount, 0);

        const cogs = filteredTransactions
            .filter(t => t.type === 'expense' && t.category === 'Cost of Goods Sold')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const grossProfit = sales - cogs;

        const sellingExpensesList = filteredTransactions.filter(t => t.type === 'expense' && ['Advertising', 'Commission'].includes(t.category));
        const totalSellingExpenses = sellingExpensesList.reduce((sum, t) => sum + t.amount, 0);

        const adminExpensesList = filteredTransactions.filter(t => t.type === 'expense' && ['Office Supplies', 'Office Equipment'].includes(t.category));
        const totalAdminExpenses = adminExpensesList.reduce((sum, t) => sum + t.amount, 0);

        const totalOperatingExpenses = totalSellingExpenses + totalAdminExpenses;
        const operatingIncome = grossProfit - totalOperatingExpenses;

        const interestRevenue = filteredTransactions
            .filter(t => t.type === 'income' && t.category === 'Interest Income')
            .reduce((sum, t) => sum + t.amount, 0);

        const investmentGain = filteredTransactions
            .filter(t => t.type === 'income' && t.category === 'Investment Gain')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const interestExpense = filteredTransactions
            .filter(t => t.type === 'expense' && t.category === 'Interest Expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalNonOperating = interestRevenue + investmentGain - interestExpense;
        const netIncome = operatingIncome + totalNonOperating;

        return {
            sales, cogs, grossProfit,
            sellingExpensesList, totalSellingExpenses,
            adminExpensesList, totalAdminExpenses,
            totalOperatingExpenses, operatingIncome,
            interestRevenue, investmentGain, interestExpense,
            totalNonOperating, netIncome
        };
    }, [filteredTransactions]);

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
                            <CardDescription>Income Statement based on your transactions.</CardDescription>
                         </div>
                         <div className="w-48">
                            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_month">Last Month</SelectItem>
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
                    <CardTitle>Statement of Income</CardTitle>
                    <CardDescription>
                        {dateRange === 'all_time' ? 'For all time' : `For the period of ${getDateRange(dateRange) ? format(getDateRange(dateRange)!.start, 'PPP') + ' - ' + format(getDateRange(dateRange)!.end, 'PPP') : ''}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Description</TableHead>
                                <TableHead className="text-right">Amount ($)</TableHead>
                                <TableHead className="text-right">Amount ($)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Revenue Section */}
                            <TableRow><TableCell>Sales</TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.sales)}</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell>Cost of Goods Sold</TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.cogs)}</TableCell><TableCell></TableCell></TableRow>
                            <TableRow className="font-bold border-y-2 border-foreground"><TableCell>Gross Profit</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.grossProfit)}</TableCell></TableRow>
                            
                            {/* Operating Expenses Section */}
                            <TableRow><TableCell className="font-semibold pt-4">Operating Expenses</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Selling Expense</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.totalSellingExpenses)}</TableCell></TableRow>
                            {incomeStatement.sellingExpensesList.map(item => <TableRow key={item.id}><TableCell className="pl-12">{item.description}</TableCell><TableCell className="text-right font-mono">{formatCurrency(item.amount)}</TableCell><TableCell></TableCell></TableRow>)}
                            
                            <TableRow><TableCell className="pl-6">Administrative Expense</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.totalAdminExpenses)}</TableCell></TableRow>
                            {incomeStatement.adminExpensesList.map(item => <TableRow key={item.id}><TableCell className="pl-12">{item.description}</TableCell><TableCell className="text-right font-mono">{formatCurrency(item.amount)}</TableCell><TableCell></TableCell></TableRow>)}
                            
                            <TableRow className="border-t"><TableCell className="font-semibold pl-4">Total Operating Expenses</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.totalOperatingExpenses)}</TableCell></TableRow>
                            <TableRow className="font-bold border-y-2 border-foreground"><TableCell>Operating Income</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.operatingIncome)}</TableCell></TableRow>

                            {/* Non-Operating Section */}
                            <TableRow><TableCell className="font-semibold pt-4">Non-operating / other transactions</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Revenue from Interest</TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.interestRevenue)}</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Gain on the sale of Investments</TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.investmentGain)}</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Interest Expenses</TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(incomeStatement.interestExpense)}</TableCell><TableCell></TableCell></TableRow>
                            <TableRow className="border-t"><TableCell className="font-semibold pl-4">Total Non-operating</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.totalNonOperating)}</TableCell></TableRow>

                            {/* Net Income */}
                            <TableRow className="font-bold text-lg bg-muted"><TableCell>Net Income</TableCell><TableCell></TableCell><TableCell className="text-right font-mono border-t-4 border-double border-foreground">{formatCurrency(incomeStatement.netIncome)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>>
        </div>
    );
}

    