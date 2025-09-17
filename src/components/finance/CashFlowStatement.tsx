
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

const INVESTING_CATEGORIES = ['Investment Gain'];
const FINANCING_EXPENSE_CATEGORIES = ['Interest Expense'];
const FINANCING_INCOME_CATEGORIES = ['Loan'];


export function CashFlowStatement({ transactions, dateRange }: ReportProps) {
    const range = getDateRange(dateRange);

    const cashFlow = useMemo(() => {
        const relevantTransactions = (range === null) 
            ? transactions 
            : transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= range.start && tDate <= range.end;
              });

        const netIncome = relevantTransactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        const accountsPayableChange = relevantTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.status !== 'paid' ? t.amount : 0), 0);

        const accountsReceivableChange = relevantTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.status !== 'paid' ? -t.amount : 0), 0);
        
        const depreciationAndAmortization = 0;
        const gainOnSaleOfAssets = 0;

        const cashFromOperating = netIncome + depreciationAndAmortization + gainOnSaleOfAssets + accountsReceivableChange + accountsPayableChange;
            
        const capitalExpenditure = 0;
        const investments = relevantTransactions
            .filter(t => t.status === 'paid' && INVESTING_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
            
        const cashFromInvesting = investments - capitalExpenditure;

        const debtIssued = relevantTransactions
            .filter(t => t.status === 'paid' && FINANCING_INCOME_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const debtRepaid = relevantTransactions
            .filter(t => t.status === 'paid' && FINANCING_EXPENSE_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const cashFromFinancing = debtIssued - debtRepaid;

        const netCashFlow = cashFromOperating + cashFromInvesting + cashFromFinancing;
        const beginningCash = 0; // App doesn't track historical balance, so we start from 0 for the period.
        const endingCash = beginningCash + netCashFlow;

        return { 
            netIncome,
            depreciationAndAmortization,
            gainOnSaleOfAssets,
            accountsPayableChange,
            accountsReceivableChange,
            operatingActivities: cashFromOperating,
            capitalExpenditure,
            investments,
            investingActivities: cashFromInvesting,
            debtIssued,
            debtRepaid,
            financingActivities: cashFromFinancing, 
            netCashFlow, 
            beginningCash, 
            endingCash 
        };
    }, [transactions, range]);


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
                        <TableRow><TableCell>Net Income</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.netIncome)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold pt-4">Adjustments to Reconcile Net Income:</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Depreciation and amortization</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.depreciationAndAmortization)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Gain on sale of assets</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.gainOnSaleOfAssets)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(Increase) Decrease in Accounts Receivable</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.accountsReceivableChange)}</TableCell></TableRow>
                         <TableRow className="border-b"><TableCell className="pl-6">Increase (Decrease) in Accounts Payable</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.accountsPayableChange)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Provided by Operating Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.operatingActivities)}</TableCell></TableRow>

                        {/* Investing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM INVESTING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Capital expenditure</TableCell><TableCell className="text-right font-mono">{formatNegative(-cashFlow.capitalExpenditure)}</TableCell></TableRow>
                        <TableRow className="border-b"><TableCell className="pl-6">(Proceeds) from sale of investments</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.investments)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Used in Investing Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.investingActivities)}</TableCell></TableRow>
                        
                        {/* Financing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM FINANCING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Debt issued</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.debtIssued)}</TableCell></TableRow>
                         <TableRow className="border-b"><TableCell className="pl-6">Debt repaid</TableCell><TableCell className="text-right font-mono">{formatNegative(-cashFlow.debtRepaid)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Provided by Financing Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.financingActivities)}</TableCell></TableRow>

                        {/* Totals */}
                        <TableRow><TableCell className="font-semibold pt-4">Beginning Cash Balance</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.beginningCash)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold">Net Increase in Cash</TableCell><TableCell className="text-right font-mono border-b">{formatNegative(cashFlow.netCashFlow)}</TableCell></TableRow>
                        <TableRow className="font-bold text-lg bg-muted"><TableCell>Ending Cash Balance</TableCell><TableCell className="text-right font-mono border-t-4 border-double border-foreground">{formatNegative(cashFlow.endingCash)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
