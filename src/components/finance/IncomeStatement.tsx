
'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { getDateRange, formatCurrency, AccountingStandard } from './FinancialReports';

interface ReportProps {
    transactions: Transaction[];
    dateRange: 'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'all_time';
    standard: AccountingStandard;
}

export function IncomeStatement({ transactions, dateRange, standard }: ReportProps) {
    const incomeStatement = useMemo(() => {
        // Shared Calculations
        const revenue = transactions
            .filter(t => t.type === 'income' && !['Interest Income', 'Investment Gain'].includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const cogs = transactions
            .filter(t => t.type === 'expense' && t.category === 'Cost of Goods Sold')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const grossProfit = revenue - cogs;

        const sellingExpensesList = transactions.filter(t => t.type === 'expense' && ['Advertising', 'Commission'].includes(t.category));
        const totalSellingExpenses = sellingExpensesList.reduce((sum, t) => sum + t.amount, 0);

        const adminExpensesList = transactions.filter(t => t.type === 'expense' && ['Office Supplies', 'Office Equipment', 'Utilities', 'Rent/Mortgage'].includes(t.category));
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
            
        const incomeBeforeTax = operatingIncome + interestRevenue + investmentGain - interestExpense;
        const taxes = 0; // Simplified
        const netIncome = incomeBeforeTax - taxes;

        return {
            revenue, cogs, grossProfit,
            sellingExpensesList, totalSellingExpenses,
            adminExpensesList, totalAdminExpenses,
            totalOperatingExpenses, operatingIncome,
            interestRevenue, investmentGain, interestExpense,
            incomeBeforeTax, taxes, netIncome
        };
    }, [transactions]);
    
    const range = getDateRange(dateRange);
    
    const reportTitle = standard === 'IFRS' ? 'Statement of Profit or Loss' : 'Statement of Income';
    const netIncomeLabel = standard === 'IFRS' ? 'Profit for the period' : 'Net Income';

    // HGB uses "Total output" method which is slightly different but we'll represent it as Revenue.
    const revenueLabel = standard === 'HGB' ? 'Total output' : 'Sales/Revenue';


    return (
        <Card>
            <CardHeader>
                <CardTitle>{reportTitle}</CardTitle>
                <CardDescription>
                    {dateRange === 'all_time' ? 'For all time' : `For the period of ${range ? format(range.start, 'PPP') + ' - ' + format(range.end, 'PPP') : ''}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow><TableCell>{revenueLabel}</TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.revenue)}</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Cost of Goods Sold</TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(incomeStatement.cogs)}</TableCell><TableCell></TableCell></TableRow>
                        <TableRow className="font-bold border-y-2 border-foreground"><TableCell>Gross Profit</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.grossProfit)}</TableCell></TableRow>
                        
                        <TableRow><TableCell className="font-semibold pt-4">Operating Expenses</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Selling Expense</TableCell><TableCell></TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(incomeStatement.totalSellingExpenses)}</TableCell></TableRow>
                        {incomeStatement.sellingExpensesList.map(item => <TableRow key={item.id}><TableCell className="pl-12">{item.description}</TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(item.amount)}</TableCell><TableCell></TableCell></TableRow>)}
                        
                        <TableRow><TableCell className="pl-6">Administrative Expense</TableCell><TableCell></TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(incomeStatement.totalAdminExpenses)}</TableCell></TableRow>
                        {incomeStatement.adminExpensesList.map(item => <TableRow key={item.id}><TableCell className="pl-12">{item.description}</TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(item.amount)}</TableCell><TableCell></TableCell></TableRow>)}
                        
                        <TableRow className="border-t"><TableCell className="font-semibold pl-4">Total Operating Expenses</TableCell><TableCell></TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(incomeStatement.totalOperatingExpenses)}</TableCell></TableRow>
                        <TableRow className="font-bold border-y-2 border-foreground"><TableCell>Operating Income</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.operatingIncome)}</TableCell></TableRow>

                        <TableRow><TableCell className="font-semibold pt-4">Non-operating / other</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Interest Revenue</TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.interestRevenue)}</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Investment Gain</TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.investmentGain)}</TableCell><TableCell></TableCell></TableRow>
                        <TableRow className="border-b"><TableCell className="pl-6">Interest Expense</TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(incomeStatement.interestExpense)}</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Income before tax</TableCell><TableCell></TableCell><TableCell className="text-right font-mono">{formatCurrency(incomeStatement.incomeBeforeTax)}</TableCell></TableRow>
                        <TableRow><TableCell>Income tax expense</TableCell><TableCell></TableCell><TableCell className="text-right font-mono text-destructive">-{formatCurrency(incomeStatement.taxes)}</TableCell></TableRow>

                        <TableRow className="font-bold text-lg bg-muted"><TableCell>{netIncomeLabel}</TableCell><TableCell></TableCell><TableCell className="text-right font-mono border-t-4 border-double border-foreground">{formatCurrency(incomeStatement.netIncome)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
