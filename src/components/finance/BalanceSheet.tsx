
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

export function BalanceSheet({ transactions, dateRange }: ReportProps) {
    const range = getDateRange(dateRange);

    const dynamicData = useMemo(() => {
        const relevantTransactions = (range === null) 
            ? transactions 
            : transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= range.start && tDate <= range.end;
              });

        const cash = relevantTransactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

        const receivables = relevantTransactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const payables = relevantTransactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const retainedEarnings = relevantTransactions
            .filter(t => t.status === 'paid') // Only paid transactions affect retained earnings
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

        return { cash, receivables, payables, retainedEarnings };
    }, [transactions, dateRange, range]);
    
    const totalAssets = dynamicData.cash + dynamicData.receivables;
    const totalLiabilities = dynamicData.payables;
    const totalEquity = dynamicData.retainedEarnings;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>
                     As of {range ? format(range.end, 'PPP') : format(new Date(), 'PPP')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-center">ASSETS</h3>
                    <Table>
                        <TableBody>
                            <TableRow><TableCell className="font-semibold">Current assets</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Cash and cash equivalents</TableCell><TableCell className="text-right font-mono">{formatCurrency(dynamicData.cash)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Accounts receivable</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.receivables)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total current assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(totalAssets)}</TableCell></TableRow>
                            
                            <TableRow className="bg-muted"><TableCell className="font-bold text-lg">Total assets</TableCell><TableCell className="text-right font-mono font-bold text-lg border-t-4 border-double border-foreground">{formatCurrency(totalAssets)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-center">LIABILITIES AND SHAREHOLDERS' EQUITY</h3>
                    <Table>
                        <TableBody>
                            <TableRow><TableCell className="font-semibold">Current liabilities</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Accounts payable</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.payables)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-bold">Total liabilities</TableCell><TableCell className="text-right font-mono font-bold">{formatCurrency(totalLiabilities)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Shareholders' Equity</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Retained earnings</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.retainedEarnings)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total shareholders' equity</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(totalEquity)}</TableCell></TableRow>

                            <TableRow className="bg-muted"><TableCell className="font-bold text-lg">Total liabilities and equity</TableCell><TableCell className="text-right font-mono font-bold text-lg border-t-4 border-double border-foreground">{formatCurrency(totalLiabilitiesAndEquity)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    );
}
    

    