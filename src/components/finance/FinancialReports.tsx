
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, startOfMonth, endOfMonth, subDays, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowDown, ArrowUp } from 'lucide-react';

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

        return { 
            incomeByCategory, 
            totalIncome,
            expensesByCategory,
            totalExpenses,
            netIncome: totalIncome - totalExpenses 
        };
    }, [filteredTransactions]);

    const cashFlowStatement = useMemo(() => {
        const paidTransactions = filteredTransactions.filter(t => t.status === 'paid');
        
        const netEarnings = paidTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const operatingExpenses = paidTransactions
            .filter(t => t.type === 'expense' && !['Investment', 'Equipment', 'Loan', 'Financing'].includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const netCashFromOps = netEarnings - operatingExpenses;

        const investingCashFlow = paidTransactions
            .filter(t => t.type === 'expense' && ['Investment', 'Equipment'].includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const financingCashFlow = paidTransactions
            .filter(t => t.type === 'expense' && ['Loan', 'Financing'].includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        return { 
            netEarnings, 
            operatingExpenses, 
            netCashFromOps, 
            investingCashFlow, 
            financingCashFlow,
            netCashFlow: netCashFromOps - investingCashFlow - financingCashFlow
        };
    }, [filteredTransactions]);
    
    const balanceSheet = useMemo(() => {
        const accountsReceivable = filteredTransactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const accountsPayable = filteredTransactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const equity = incomeStatement.netIncome;

        const totalAssets = accountsReceivable;
        const totalLiabilities = accountsPayable;
        const totalEquity = equity;
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

        return {
            totalAssets,
            accountsReceivable,
            totalLiabilities,
            accountsPayable,
            totalEquity,
            retainedEarnings: equity,
            totalLiabilitiesAndEquity
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
            
            <div className="grid lg:grid-cols-2 gap-4 items-start">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Income Statement</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableBody>
                                <TableRow className="font-bold">
                                    <TableCell>Revenue</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                {Object.entries(incomeStatement.incomeByCategory).map(([cat, amt]) => (
                                    <TableRow key={`inc-${cat}`}><TableCell className="pl-6">{cat}</TableCell><TableCell className="text-right font-mono">${amt.toFixed(2)}</TableCell></TableRow>
                                ))}
                                <TableRow className="font-semibold border-t">
                                    <TableCell>Total Revenue</TableCell>
                                    <TableCell className="text-right font-mono text-green-500">${incomeStatement.totalIncome.toFixed(2)}</TableCell>
                                </TableRow>
                                
                                <TableRow className="font-bold pt-4">
                                    <TableCell>Expenses</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                 {Object.entries(incomeStatement.expensesByCategory).map(([cat, amt]) => (
                                    <TableRow key={`exp-${cat}`}><TableCell className="pl-6">{cat}</TableCell><TableCell className="text-right font-mono">${amt.toFixed(2)}</TableCell></TableRow>
                                ))}
                                <TableRow className="font-semibold border-t">
                                    <TableCell>Total Expenses</TableCell>
                                    <TableCell className="text-right font-mono text-red-500">${incomeStatement.totalExpenses.toFixed(2)}</TableCell>
                                </TableRow>

                                <TableRow className="font-bold text-lg bg-muted border-t-2 border-border">
                                    <TableCell>Net Income</TableCell>
                                    <TableCell className="text-right font-mono">${incomeStatement.netIncome.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cash Flow Statement</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <Table>
                               <TableBody>
                                    <TableRow className="font-semibold"><TableCell colSpan={2}>Cash Flow From Operations</TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Net Earnings</TableCell><TableCell className="text-right font-mono">${cashFlowStatement.netEarnings.toFixed(2)}</TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Operating Expenses</TableCell><TableCell className="text-right font-mono">(${cashFlowStatement.operatingExpenses.toFixed(2)})</TableCell></TableRow>
                                    <TableRow className="font-medium border-t"><TableCell className="pl-4">Net Cash From Operations</TableCell><TableCell className="text-right font-mono">${cashFlowStatement.netCashFromOps.toFixed(2)}</TableCell></TableRow>
                                    
                                    <TableRow className="font-semibold"><TableCell colSpan={2}>Cash Flow From Investing</TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Equipment & Investments</TableCell><TableCell className="text-right font-mono">(${cashFlowStatement.investingCashFlow.toFixed(2)})</TableCell></TableRow>
                                    
                                    <TableRow className="font-semibold"><TableCell colSpan={2}>Cash Flow From Financing</TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Loans & Financing</TableCell><TableCell className="text-right font-mono">(${cashFlowStatement.financingCashFlow.toFixed(2)})</TableCell></TableRow>
                                    
                                    <TableRow className="font-bold bg-muted border-t-2 border-border">
                                        <TableCell>Net Cash Flow</TableCell>
                                        <TableCell className="text-right font-mono">${cashFlowStatement.netCashFlow.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Sheet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                               <TableBody>
                                    <TableRow className="font-bold"><TableCell colSpan={2}>Assets</TableCell></TableRow>
                                    <TableRow className="font-semibold"><TableCell className="pl-4">Current Assets</TableCell><TableCell></TableCell></TableRow>
                                    <TableRow><TableCell className="pl-8">Accounts Receivable</TableCell><TableCell className="text-right font-mono">${balanceSheet.accountsReceivable.toFixed(2)}</TableCell></TableRow>
                                    <TableRow className="font-bold border-t"><TableCell>Total Assets</TableCell><TableCell className="text-right font-mono border-t-2 border-double border-foreground">${balanceSheet.totalAssets.toFixed(2)}</TableCell></TableRow>
                                    
                                    <TableRow className="font-bold pt-4"><TableCell colSpan={2}>Liabilities & Equity</TableCell></TableRow>
                                    <TableRow className="font-semibold"><TableCell className="pl-4">Liabilities</TableCell><TableCell></TableCell></TableRow>
                                    <TableRow><TableCell className="pl-8">Accounts Payable</TableCell><TableCell className="text-right font-mono">${balanceSheet.accountsPayable.toFixed(2)}</TableCell></TableRow>
                                    <TableRow className="font-semibold border-t"><TableCell className="pl-4">Total Liabilities</TableCell><TableCell className="text-right font-mono">${balanceSheet.totalLiabilities.toFixed(2)}</TableCell></TableRow>
                                    
                                    <TableRow className="font-semibold"><TableCell className="pl-4">Shareholders' Equity</TableCell><TableCell></TableCell></TableRow>
                                    <TableRow><TableCell className="pl-8">Retained Earnings (Net Income)</TableCell><TableCell className="text-right font-mono">${balanceSheet.retainedEarnings.toFixed(2)}</TableCell></TableRow>
                                    <TableRow className="font-semibold border-t"><TableCell className="pl-4">Total Equity</TableCell><TableCell className="text-right font-mono">${balanceSheet.totalEquity.toFixed(2)}</TableCell></TableRow>
                                    
                                    <TableRow className="font-bold border-t"><TableCell>Total Liabilities & Equity</TableCell><TableCell className="text-right font-mono border-t-2 border-double border-foreground">${balanceSheet.totalLiabilitiesAndEquity.toFixed(2)}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


    