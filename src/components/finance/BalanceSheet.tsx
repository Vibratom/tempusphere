
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

const placeholderData = {
    assets: {
        current: {
            cash: 100000,
            receivables: 20000,
            inventory: 15000,
            prepaidExpense: 4000,
            investments: 10000,
        },
        property: {
            land: 24300,
            buildings: 250000,
            equipment: 50000,
            depreciation: -5000,
        },
        other: {
            intangible: 4000,
            amortization: -200,
        }
    },
    liabilities: {
        current: {
            payable: 30000,
            notes: 10000,
            accruedExpenses: 5000,
            deferredRevenue: 2000,
        },
        longTermDebt: 200000,
    },
    equity: {
        commonStock: 10000,
        additionalCapital: 20000,
        retainedEarnings: 197100,
        treasuryStock: -2000
    }
};


export function BalanceSheet({ transactions, dateRange }: ReportProps) {
    const range = getDateRange(dateRange);

    const data = placeholderData;
    const totalCurrentAssets = Object.values(data.assets.current).reduce((a, b) => a + b, 0);
    const totalProperty = Object.values(data.assets.property).reduce((a, b) => a + b, 0);
    const totalOtherAssets = Object.values(data.assets.other).reduce((a, b) => a + b, 0);
    const totalAssets = totalCurrentAssets + totalProperty + totalOtherAssets;
    
    const totalCurrentLiabilities = Object.values(data.liabilities.current).reduce((a, b) => a + b, 0);
    const totalLiabilities = totalCurrentLiabilities + data.liabilities.longTermDebt;
    const totalEquity = Object.values(data.equity).reduce((a, b) => a + b, 0);
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
                            <TableRow><TableCell className="pl-6">Cash and cash equivalents</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.current.cash)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Accounts receivable</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.current.receivables)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Inventory</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.current.inventory)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Prepaid expense</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.current.prepaidExpense)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Investments</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(data.assets.current.investments)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total current assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(totalCurrentAssets)}</TableCell></TableRow>
                            
                            <TableRow><TableCell className="font-semibold pt-4">Property and equipment</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Land</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.property.land)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Buildings and improvements</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.property.buildings)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Equipment</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.property.equipment)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Less accumulated depreciation</TableCell><TableCell className="text-right font-mono border-b">({formatCurrency(Math.abs(data.assets.property.depreciation))})</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total property and equipment</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(totalProperty)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Other assets</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Intangible assets</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.other.intangible)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Less accumulated amortization</TableCell><TableCell className="text-right font-mono border-b">({formatCurrency(Math.abs(data.assets.other.amortization))})</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total other assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(totalOtherAssets)}</TableCell></TableRow>

                            <TableRow className="bg-muted"><TableCell className="font-bold text-lg">Total assets</TableCell><TableCell className="text-right font-mono font-bold text-lg border-t-4 border-double border-foreground">{formatCurrency(totalAssets)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-center">LIABILITIES AND SHAREHOLDERS' EQUITY</h3>
                    <Table>
                        <TableBody>
                            <TableRow><TableCell className="font-semibold">Current liabilities</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Accounts payable</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.liabilities.current.payable)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Notes payable</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.liabilities.current.notes)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Accrued expenses</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.liabilities.current.accruedExpenses)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Deferred revenue</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(data.liabilities.current.deferredRevenue)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total current liabilities</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(totalCurrentLiabilities)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Long-term debt</TableCell><TableCell className="text-right font-mono font-semibold border-b">{formatCurrency(data.liabilities.longTermDebt)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-bold">Total liabilities</TableCell><TableCell className="text-right font-mono font-bold">{formatCurrency(totalLiabilities)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Shareholders' Equity</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Common stock</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.equity.commonStock)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Additional paid-in capital</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.equity.additionalCapital)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Retained earnings</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.equity.retainedEarnings)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Treasury stock</TableCell><TableCell className="text-right font-mono border-b">({formatCurrency(Math.abs(data.equity.treasuryStock))})</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total shareholders' equity</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(totalEquity)}</TableCell></TableRow>

                            <TableRow className="bg-muted"><TableCell className="font-bold text-lg">Total liabilities and shareholders' equity</TableCell><TableCell className="text-right font-mono font-bold text-lg border-t-4 border-double border-foreground">{formatCurrency(totalLiabilitiesAndEquity)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    );
}
    