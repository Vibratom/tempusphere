
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

export function CashFlowStatement({ transactions, dateRange }: ReportProps) {
    const range = getDateRange(dateRange);

    const cashFlow = useMemo(() => {
        const operating = transactions.filter(t => ['Salary', 'Freelance', 'Utilities', 'Rent/Mortgage'].includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        const investing = transactions.filter(t => ['Investment Gain'].includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
            
        const financing = transactions.filter(t => t.type === 'income' && t.category === 'Loan')
            .reduce((sum, t) => sum + t.amount, 0);

        const netCashFlow = operating + investing + financing;

        return { operating, investing, financing, netCashFlow };
    }, [transactions]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Statement of Cash Flows</CardTitle>
                <CardDescription>
                     {dateRange === 'all_time' ? 'For all time' : `For the period of ${range ? format(range.start, 'PPP') + ' - ' + format(range.end, 'PPP') : ''}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableBody>
                        <TableRow><TableCell className="font-semibold">Cash flow from operating activities</TableCell><TableCell className="text-right font-mono">{formatCurrency(cashFlow.operating)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold">Cash flow from investing activities</TableCell><TableCell className="text-right font-mono">{formatCurrency(cashFlow.investing)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold">Cash flow from financing activities</TableCell><TableCell className="text-right font-mono">{formatCurrency(cashFlow.financing)}</TableCell></TableRow>
                        <TableRow className="font-bold text-lg bg-muted"><TableCell>Net increase in cash</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatCurrency(cashFlow.netCashFlow)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
