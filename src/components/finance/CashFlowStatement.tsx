
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

const formatNegative = (value: number) => {
    const formatted = formatCurrency(Math.abs(value));
    return value < 0 ? `(${formatted.replace('$', '')})` : formatted;
}

export function CashFlowStatement({ transactions, dateRange }: ReportProps) {
    const range = getDateRange(dateRange);

    const cashFlow = useMemo(() => {
        const operating = transactions.filter(t => ['Salary', 'Freelance', 'Utilities', 'Rent/Mortgage'].includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        const investing = transactions.filter(t => ['Investment Gain'].includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), -51.6);
            
        const financing = transactions.filter(t => t.type === 'income' && t.category === 'Loan')
            .reduce((sum, t) => sum + t.amount, -495);

        const netCashFlow = operating + investing + financing;
        const beginningCash = 1326.5;
        const endingCash = beginningCash + netCashFlow;

        return { operating, investing, financing, netCashFlow, beginningCash, endingCash };
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
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60%]">Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Operating Activities */}
                        <TableRow className="font-bold bg-muted/50"><TableCell>CASH FLOWS FROM OPERATING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Net Income</TableCell><TableCell className="text-right font-mono">{formatNegative(1671.9)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold pt-4">Adjustments for Non-Cash Charges:</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(+) Depreciation</TableCell><TableCell className="text-right font-mono">{formatNegative(45.2)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(+) Amortization</TableCell><TableCell className="text-right font-mono">{formatNegative(11.3)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(+/-) Accounts Receivable</TableCell><TableCell className="text-right font-mono">{formatNegative(-201.7)}</TableCell></TableRow>
                         <TableRow className="border-b"><TableCell className="pl-6">(+/-) Accounts Payable</TableCell><TableCell className="text-right font-mono">{formatNegative(62.5)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Provided by Operating Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.operating)}</TableCell></TableRow>

                        {/* Investing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM INVESTING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(-) Net Capital Expenditures</TableCell><TableCell className="text-right font-mono">{formatNegative(-51.6)}</TableCell></TableRow>
                        <TableRow className="border-b"><TableCell className="pl-6">(-) Net Purchases of Short-Term Investments</TableCell><TableCell className="text-right font-mono">{formatNegative(transactions.filter(t=>t.category === 'Investment Gain').reduce((sum,t)=>sum+t.amount,0))}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Used in Investing Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.investing)}</TableCell></TableRow>
                        
                        {/* Financing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM FINANCING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(-) Dividends Paid</TableCell><TableCell className="text-right font-mono">{formatNegative(-500)}</TableCell></TableRow>
                        <TableRow className="border-b"><TableCell className="pl-6">(+) Debt Issuances / (-) Repayments</TableCell><TableCell className="text-right font-mono">{formatNegative(transactions.filter(t=>t.category === 'Loan').reduce((sum,t)=>sum+t.amount,5))}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Provided by Financing Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.financing)}</TableCell></TableRow>

                        {/* Totals */}
                        <TableRow><TableCell className="font-semibold pt-4">Beginning Cash</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.beginningCash)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold">(+/-) Change in Cash & Cash Equivalents</TableCell><TableCell className="text-right font-mono border-b">{formatNegative(cashFlow.netCashFlow)}</TableCell></TableRow>
                        <TableRow className="font-bold text-lg bg-muted"><TableCell>Ending Cash</TableCell><TableCell className="text-right font-mono border-t-4 border-double border-foreground">{formatNegative(cashFlow.endingCash)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
