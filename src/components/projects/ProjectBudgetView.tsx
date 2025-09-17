'use client';

import React, { useMemo } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Landmark } from 'lucide-react';

export function ProjectBudgetView() {
    const { board } = useProjects();
    const { transactions } = useFinance();

    const projectTransactions = useMemo(() => {
        const projectTaskIds = new Set(Object.keys(board.tasks));
        return transactions.filter(t => t.projectId && projectTaskIds.has(t.projectId));
    }, [transactions, board.tasks]);
    
    const projectTotals = useMemo(() => {
        const totals: Record<string, { income: number, expense: number, balance: number, count: number }> = {};
        
        projectTransactions.forEach(t => {
            if (!t.projectId) return;

            if (!totals[t.projectId]) {
                totals[t.projectId] = { income: 0, expense: 0, balance: 0, count: 0 };
            }
            
            if (t.type === 'income') {
                totals[t.projectId].income += t.amount;
                totals[t.projectId].balance += t.amount;
            } else {
                totals[t.projectId].expense += t.amount;
                totals[t.projectId].balance -= t.amount;
            }
            totals[t.projectId].count++;
        });

        return totals;
    }, [projectTransactions]);

    if (projectTransactions.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
                <Landmark className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">No Project Transactions Found</h2>
                <p className="text-muted-foreground mt-2">
                    Link transactions to your project tasks from the main Finance Hub to see them here.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Project Budget Overview</CardTitle>
                    <CardDescription>A summary of all financial transactions linked to your projects.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead className="text-right">Income</TableHead>
                            <TableHead className="text-right">Expenses</TableHead>
                            <TableHead className="text-right">Net Balance</TableHead>
                            <TableHead className="text-center">Transactions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(projectTotals).map(([projectId, totals]) => (
                                <TableRow key={projectId}>
                                    <TableCell className="font-medium">{board.tasks[projectId]?.title || 'Unknown Project'}</TableCell>
                                    <TableCell className="text-right font-mono text-green-500">+${totals.income.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-mono text-red-500">-${totals.expense.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-mono font-semibold">${totals.balance.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{totals.count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>All Project Transactions</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projectTransactions.map(t => (
                            <TableRow key={t.id}>
                                <TableCell>{format(parseISO(t.date), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="font-medium">{t.description}</TableCell>
                                <TableCell className="text-muted-foreground">{board.tasks[t.projectId!]?.title || 'Unknown'}</TableCell>
                                <TableCell className={`text-right font-mono ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
