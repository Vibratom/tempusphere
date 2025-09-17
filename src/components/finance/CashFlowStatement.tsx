
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
        
        // Simplified for this example. In a real scenario, these would be tracked separately.
        const nonCashCharges = {
            depreciation: netIncome * 0.05,
            amortization: netIncome * 0.01,
        }
        
        const accountsPayableChange = transactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const accountsReceivableChange = transactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);

        const operatingActivities = netIncome + nonCashCharges.depreciation + nonCashCharges.amortization - accountsReceivableChange + accountsPayableChange;

        const investingActivities = transactions.filter(t => INVESTING_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
            
        const financingActivities = transactions.filter(t => FINANCING_INCOME_CATEGORIES.includes(t.category) || FINANCING_EXPENSE_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

        const netCashFlow = operatingActivities + investingActivities + financingActivities;
        const beginningCash = 1326.5; // Placeholder, would need to be calculated from previous period
        const endingCash = beginningCash + netCashFlow;

        return { 
            netIncome,
            nonCashCharges,
            accountsPayableChange,
            accountsReceivableChange,
            operatingActivities, 
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
                        <TableRow><TableCell className="font-semibold pt-4">Adjustments for Non-Cash Charges:</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(+) Depreciation</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.nonCashCharges.depreciation)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(+) Amortization</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.nonCashCharges.amortization)}</TableCell></TableRow>
                        <TableRow><TableCell className="pl-6">(+/-) Accounts Receivable</TableCell><TableCell className="text-right font-mono">{formatNegative(-cashFlow.accountsReceivableChange)}</TableCell></TableRow>
                         <TableRow className="border-b"><TableCell className="pl-6">(+/-) Accounts Payable</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.accountsPayableChange)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Provided by Operating Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.operatingActivities)}</TableCell></TableRow>

                        {/* Investing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM INVESTING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                        <TableRow className="border-b"><TableCell className="pl-6">Gain/Loss from Investments</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.investingActivities)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Used in Investing Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.investingActivities)}</TableCell></TableRow>
                        
                        {/* Financing Activities */}
                        <TableRow className="font-bold bg-muted/50 mt-4"><TableCell>CASH FLOWS FROM FINANCING ACTIVITIES</TableCell><TableCell></TableCell></TableRow>
                         <TableRow className="border-b"><TableCell className="pl-6">(+) Debt Issuances / (-) Repayments</TableCell><TableCell className="text-right font-mono">{formatNegative(cashFlow.financingActivities)}</TableCell></TableRow>
                        <TableRow className="font-bold"><TableCell>Net Cash Provided by Financing Activities</TableCell><TableCell className="text-right font-mono border-t-2 border-foreground">{formatNegative(cashFlow.financingActivities)}</TableCell></TableRow>

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
