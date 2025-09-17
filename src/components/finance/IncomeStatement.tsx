
'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { getDateRange, formatCurrency } from './FinancialReports';

interface ReportProps {
    transactions: Transaction[];
    dateRange: 'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'all_time';
}

export function IncomeStatement({ transactions, dateRange }: ReportProps) {
    const incomeStatement = useMemo(() => {
        const sales = transactions
            .filter(t => t.type === 'income' && t.category !== 'Interest Income' && t.category !== 'Investment Gain')
            .reduce((sum, t) => sum + t.amount, 0);

        const cogs = transactions
            .filter(t => t.type === 'expense' && t.category === 'Cost of Goods Sold')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const grossProfit = sales - cogs;

        const sellingExpensesList = transactions.filter(t => t.type === 'expense' && ['Advertising', 'Commission'].includes(t.category));
        const totalSellingExpenses = sellingExpensesList.reduce((sum, t) => sum + t.amount, 0);

        const adminExpensesList = transactions.filter(t => t.type === 'expense' && ['Office Supplies', 'Office Equipment'].includes(t.category));
        const totalAdminExpenses = adminExpensesList.reduce((sum, t) => sum + t.amount, 0);

        const totalOperatingExpenses = totalSellingExpenses + totalAdminExpenses;
        const operatingIncome = grossProfit - totalOperatingExpenses;

        const interestRevenue = transactions
            .filter(t => t.type === 'income' && t.category === 'Interest Income')
            .reduce((sum, t) => sum + t.amount, 0);

        const investmentGain = transactions
            .filter(t => t.type === 'income' && t.category === 'Investment Gain')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const interestExpense = transactions
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
    }, [transactions]);
    
    const range = getDateRange(dateRange);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statement of Income</CardTitle>
                <CardDescription>
                    {dateRange === 'all_time' ? 'For all time' : `For the period of ${range ? format(range.start, 'PPP') + ' - ' + format(range.end, 'PPP') : ''}`}
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
        </Card>
    );
}
