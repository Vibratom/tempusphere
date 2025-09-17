
'use client';

import React from 'react';
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

    // Note: This is a simplified Balance Sheet based on transaction data.
    // A real balance sheet would require more complex state management.
    const assets = 10000; // Placeholder
    const liabilities = 2000; // Placeholder
    const equity = assets - liabilities; // Placeholder

    return (
        <Card>
            <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>
                     As of {range ? format(range.end, 'PPP') : format(new Date(), 'PPP')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableBody>
                        <TableRow className="font-bold text-lg"><TableCell>Assets</TableCell><TableCell className="text-right font-mono">{formatCurrency(assets)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Cash</TableCell><TableCell className="text-right font-mono">{formatCurrency(assets)}</TableCell></TableRow>
                        
                        <TableRow className="font-bold text-lg pt-4"><TableCell>Liabilities</TableCell><TableCell className="text-right font-mono">{formatCurrency(liabilities)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Accounts Payable</TableCell><TableCell className="text-right font-mono">{formatCurrency(liabilities)}</TableCell></TableRow>
                        
                        <TableRow className="font-bold text-lg pt-4"><TableCell>Equity</TableCell><TableCell className="text-right font-mono">{formatCurrency(equity)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Retained Earnings</TableCell><TableCell className="text-right font-mono">{formatCurrency(equity)}</TableCell></TableRow>
                        
                        <TableRow className="font-bold text-lg bg-muted"><TableCell>Total Liabilities & Equity</TableCell><TableCell className="text-right font-mono border-t-4 border-double border-foreground">{formatCurrency(liabilities + equity)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
