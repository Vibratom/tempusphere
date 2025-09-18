
'use client';

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Target } from 'lucide-react';

export function BudgetHealth() {
    const { budgets, transactions } = useFinance();

    const budgetStatus = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return budgets.map(budget => {
            const relevantTransactions = transactions.filter(t => {
                if (t.category !== budget.category || t.type !== 'expense') return false;
                
                const tDate = new Date(t.date);
                if (budget.period === 'monthly') {
                    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                } else { // yearly
                    return tDate.getFullYear() === currentYear;
                }
            });

            const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
            const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

            return {
                ...budget,
                spent,
                progress
            };
        }).sort((a,b) => b.progress - a.progress);

    }, [budgets, transactions]);
    
    if (budgets.length === 0) {
        return null; // Don't render the card if no budgets are set
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
                <CardTitle>Budget Health</CardTitle>
                <CardDescription>Your spending progress against your set budgets for this {new Date().toLocaleString('default', { month: 'long' })}.</CardDescription>
            </CardHeader>
            <CardContent>
                {budgetStatus.length > 0 ? (
                    <ScrollArea className="h-64">
                      <div className="pr-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                        {budgetStatus.map(status => (
                            <div key={status.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-medium text-sm">{status.category}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className={cn(status.progress > 100 && 'text-destructive font-semibold')}>
                                            ${status.spent.toFixed(2)}
                                        </span> / ${status.amount.toFixed(2)}
                                    </p>
                                </div>
                                <Progress 
                                    value={Math.min(100, status.progress)} 
                                    className={cn(
                                        status.progress > 100 && '[&>*]:bg-destructive',
                                        status.progress > 75 && status.progress <= 100 && '[&>*]:bg-yellow-500'
                                    )}
                                />
                            </div>
                        ))}
                      </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <Target className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No Budgets Set</h3>
                        <p className="mt-1 text-sm">Go to the 'Budget' tab to create spending limits.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

