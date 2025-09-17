
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, startOfMonth, endOfMonth, subDays, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { IncomeStatement } from './IncomeStatement';
import { BalanceSheet } from './BalanceSheet';
import { CashFlowStatement } from './CashFlowStatement';

type DateRange = 'this_month' | 'last_month' | 'last_90_days' | 'this_year' | 'all_time';

export const getDateRange = (range: DateRange): { start: Date, end: Date } | null => {
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

export const formatCurrency = (value: number) => {
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


    if (!isClient) {
        return null;
    }

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                         <div>
                            <CardTitle>Financial Reports</CardTitle>
                            <CardDescription>A summary of your business's financial health.</CardDescription>
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
            
            <IncomeStatement transactions={filteredTransactions} dateRange={dateRange} />
            <BalanceSheet transactions={filteredTransactions} dateRange={dateRange} />
            <CashFlowStatement transactions={filteredTransactions} dateRange={dateRange} />
        </div>
    );
}
