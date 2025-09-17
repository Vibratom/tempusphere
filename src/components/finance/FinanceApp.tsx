
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectsContext';
import { Skeleton } from '../ui/skeleton';
import { IncomeStatementWaterfall } from './IncomeStatementWaterfall';
import { BalanceSheetChart } from './BalanceSheetChart';
import { CashFlowChart } from './CashFlowChart';
import { DynamicReportChart } from './DynamicReportChart';

export function FinanceApp() {
    const { transactions } = useFinance();
    const { board } = useProjects();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const financialSummary = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpense += t.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [transactions]);
    
    const { accountsReceivable, accountsPayable } = useMemo(() => {
        const ar = transactions.filter(t => t.type === 'income' && t.status !== 'paid');
        const ap = transactions.filter(t => t.type === 'expense' && t.status !== 'paid');
        return { accountsReceivable: ar, accountsPayable: ap };
    }, [transactions]);

    if (!isClient) {
        return (
             <div className="w-full flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-20" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-20" /></CardHeader><CardContent><Skeleton className="h-9 w-full" /></CardContent></Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Income Statement</CardTitle>
                        <CardDescription>A visual breakdown of revenue, expenses, and net income.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-80 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col gap-4 md:gap-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground"><ArrowUp className="text-green-500"/> Total Income</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <p className="text-xl sm:text-2xl font-bold text-green-500">${financialSummary.totalIncome.toFixed(2)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground"><ArrowDown className="text-red-500"/> Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <p className="text-xl sm:text-2xl font-bold text-red-500">${financialSummary.totalExpense.toFixed(2)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <p className="text-xl sm:text-2xl font-bold">${(financialSummary.totalIncome - financialSummary.totalExpense).toFixed(2)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="p-3 sm:p-6">
                         <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">A/P vs A/R</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">Receivable</p>
                                <p className="text-sm sm:text-base font-bold text-green-500">${accountsReceivable.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                            </div>
                             <div className="text-center">
                                <p className="text-xs text-muted-foreground">Payable</p>
                                <p className="text-sm sm:text-base font-bold text-red-500">${accountsPayable.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle>Income Statement</CardTitle>
                        <CardDescription>Revenue, expenses, and net income.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <IncomeStatementWaterfall />
                    </CardContent>
                </Card>
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle>Balance Sheet</CardTitle>
                        <CardDescription>Assets vs. Liabilities & Equity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BalanceSheetChart />
                    </CardContent>
                </Card>
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle>Cash Flow</CardTitle>
                        <CardDescription>Change in cash from activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CashFlowChart />
                    </CardContent>
                </Card>
            </div>

             <Card className="col-span-1 xl:col-span-3">
                <CardHeader>
                    <CardTitle>Dynamic Report</CardTitle>
                    <CardDescription>Select metrics from any financial statement to build a custom comparison chart.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicReportChart />
                </CardContent>
            </Card>
        </div>
    );
}
