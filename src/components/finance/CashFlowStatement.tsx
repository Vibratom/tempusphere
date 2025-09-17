
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

const OPERATING_INCOME_CATEGORIES = ['Salary', 'Freelance'];
const OPERATING_EXPENSE_CATEGORIES = ['Groceries', 'Utilities', 'Rent/Mortgage', 'Transportation', 'Entertainment', 'Office Supplies', 'Office Equipment', 'Advertising', 'Commission', 'Cost of Goods Sold'];
const INVESTING_CATEGORIES = ['Investment Gain'];
const FINANCING_EXPENSE_CATEGORIES = ['Interest Expense'];
const FINANCING_INCOME_CATEGORIES = ['Loan'];


export function CashFlowStatement({ transactions, dateRange }: ReportProps) {
    const range = getDateRange(dateRange);

    const cashFlow = useMemo(() => {
        const netIncome = transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        const accountsPayableChange = transactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const accountsReceivableChange = transactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const cashFromOperating = netIncome - accountsReceivableChange + accountsPayableChange;
            
        const investingActivities = transactions
            .filter(t => t.status === 'paid' && INVESTING_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
            
        const financingActivities = transactions
            .filter(t => t.status === 'paid' && (FINANCING_INCOME_CATEGORIES.includes(t.category) || FINANCING_EXPENSE_CATEGORIES.includes(t.category)))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

        const netCashFlow = cashFromOperating + investingActivities + financingActivities;
        const beginningCash = 0; // App doesn't track historical balance, so we start from 0 for the period.
        const endingCash = beginningCash + netCashFlow;

        return { 
            netIncome,
            accountsPayableChange,
            accountsReceivableChange,
            operatingActivities: cashFromOperating, 
            investingActivities, 
            financingActivities, 
            netCashFlow, 
            beginningCash, 
            endingCash 
        };
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
                        <TableRow><TableCell>Net Income</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.netIncome)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold pt-4">Adjustments to Reconcile Net Income:</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">Increase in Accounts Receivable</TableCell><TableCell className="text-right font-mono">{formatNegative(-cashFlow.accountsReceivableChange)}</TableCell></TableRow>
                         <TableRow className="border-b"><TableCell className="pl-6">Increase in Accounts Payable</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.accountsPayableChange)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Provided by Operating Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.operatingActivities)}</TableCell></TableRow>

                        {/* Investing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM INVESTING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                        <TableRow className="border-b"><TableCell className="pl-6">Gain/Loss from Investments</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.investingActivities)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Used in Investing Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.investingActivities)}</TableCell></TableRow>
                        
                        {/* Financing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM FINANCING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                         <TableRow className="border-b"><TableCell className="pl-6">Debt Issuances / Repayments</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.financingActivities)}</TableCell></TableRow>
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


    