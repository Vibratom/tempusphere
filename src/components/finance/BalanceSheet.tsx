
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

export function BalanceSheet({ transactions, dateRange, standard }: ReportProps) {
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
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

        const inventory = 0;
        const land = 0;
        const buildings = 0;
        const longTermDebt = 0;
        const commonStock = 0;

        const currentAssets = { cash, receivables, inventory };
        const fixedAssets = { land, buildings };
        const totalCurrentAssets = Object.values(currentAssets).reduce((a,b) => a+b, 0);
        const totalFixedAssets = Object.values(fixedAssets).reduce((a,b) => a+b, 0);

        const assets = {
          current: totalCurrentAssets,
          fixed: totalFixedAssets,
          total: totalCurrentAssets + totalFixedAssets
        };

        const currentLiabilities = { payables };
        const longTermLiabilities = { longTermDebt };
        const totalCurrentLiabilities = Object.values(currentLiabilities).reduce((a,b) => a+b, 0);
        const totalLongTermLiabilities = Object.values(longTermLiabilities).reduce((a,b) => a+b, 0);
        
        const liabilities = {
          current: totalCurrentLiabilities,
          longTerm: totalLongTermLiabilities,
          total: totalCurrentLiabilities + totalLongTermLiabilities
        };

        const equity = {
          commonStock,
          retainedEarnings,
          total: commonStock + retainedEarnings
        };

        return { 
            currentAssets, fixedAssets, assets,
            currentLiabilities, longTermLiabilities, liabilities,
            equity
        };
    }, [transactions, range]);
    
    const totalLiabilitiesAndEquity = dynamicData.liabilities.total + dynamicData.equity.total;
    const reportTitle = standard === 'IFRS' ? 'Statement of Financial Position' : 'Balance Sheet';

    const renderAssets = () => {
        const rows = [
            <TableRow key="ca-h"><TableCell className="font-semibold">Current assets</TableCell><TableCell></TableCell></TableRow>,
            <TableRow key="ca-1"><TableCell className="pl-6">Cash and cash equivalents</TableCell><TableCell className="text-right font-mono">{formatCurrency(dynamicData.currentAssets.cash)}</TableCell></TableRow>,
            <TableRow key="ca-2"><TableCell className="pl-6">Accounts receivable</TableCell><TableCell className="text-right font-mono">{formatCurrency(dynamicData.currentAssets.receivables)}</TableCell></TableRow>,
            <TableRow key="ca-3"><TableCell className="pl-6">Inventory</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.currentAssets.inventory)}</TableCell></TableRow>,
            <TableRow key="tca"><TableCell className="font-semibold pl-4">Total current assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(dynamicData.assets.current)}</TableCell></TableRow>,
            
            <TableRow key="fa-h"><TableCell className="font-semibold pt-4">Property and equipment</TableCell><TableCell></TableCell></TableRow>,
            <TableRow key="fa-1"><TableCell className="pl-6">Land</TableCell><TableCell className="text-right font-mono">{formatCurrency(dynamicData.fixedAssets.land)}</TableCell></TableRow>,
            <TableRow key="fa-2"><TableCell className="pl-6">Buildings</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.fixedAssets.buildings)}</TableCell></TableRow>,
            <TableRow key="tfa"><TableCell className="font-semibold pl-4">Total property and equipment</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(dynamicData.assets.fixed)}</TableCell></TableRow>
        ];

        // IFRS often lists non-current assets first
        if (standard === 'IFRS') {
            return [
                ...rows.slice(5), // Fixed assets
                ...rows.slice(0, 5) // Current assets
            ];
        }
        return rows;
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle>{reportTitle}</CardTitle>
                <CardDescription>
                     As of {range ? format(range.end, 'PPP') : format(new Date(), 'PPP')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-center">ASSETS</h3>
                    <Table>
                        <TableBody>
                            {renderAssets()}
                            <TableRow className="bg-muted"><TableCell className="font-bold text-lg">Total assets</TableCell><TableCell className="text-right font-mono font-bold text-lg border-t-4 border-double border-foreground">{formatCurrency(dynamicData.assets.total)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-center">LIABILITIES AND SHAREHOLDERS' EQUITY</h3>
                    <Table>
                        <TableBody>
                            <TableRow><TableCell className="font-semibold">Current liabilities</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Accounts payable</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.currentLiabilities.payables)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total current liabilities</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(dynamicData.liabilities.current)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Long-term liabilities</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Long-term debt</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.longTermLiabilities.longTermDebt)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total long-term liabilities</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(dynamicData.liabilities.longTerm)}</TableCell></TableRow>
                            
                            <TableRow className="border-y border-foreground"><TableCell className="font-bold">Total liabilities</TableCell><TableCell className="text-right font-mono font-bold">{formatCurrency(dynamicData.liabilities.total)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Shareholders' Equity</TableCell><TableCell></TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">Common stock</TableCell><TableCell className="text-right font-mono">{formatCurrency(dynamicData.equity.commonStock)}</TableCell></TableRow>
                            <TableRow><TableCell className="pl-6">{standard === 'HGB' ? 'Annual surplus/deficit' : 'Retained earnings'}</TableCell><TableCell className="text-right font-mono border-b">{formatCurrency(dynamicData.equity.retainedEarnings)}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold pl-4">Total shareholders' equity</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(dynamicData.equity.total)}</TableCell></TableRow>

                            <TableRow className="bg-muted"><TableCell className="font-bold text-lg">Total liabilities and equity</TableCell><TableCell className="text-right font-mono font-bold text-lg border-t-4 border-double border-foreground">{formatCurrency(totalLiabilitiesAndEquity)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    );
}
