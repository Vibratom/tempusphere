'use client';

import React, { useMemo, useState } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { useFinance, Transaction, TransactionType } from '@/contexts/FinanceContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Banknote, Landmark, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function TransactionForm({ onSave, projects }: { onSave: (t: Omit<Transaction, 'id'>) => void, projects: { id: string, title: string }[] }) {
    const { categories, addCategory } = useFinance();
    const [date, setDate] = useState<Date>(new Date());
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [projectId, setProjectId] = useState<string | undefined>(undefined);
    const { toast } = useToast();

    const handleSave = () => {
        let finalCategory = category;
        if (category === 'new' && newCategory.trim()) {
            addCategory(newCategory.trim());
            finalCategory = newCategory.trim();
        }
        
        if (!description || amount <= 0 || !finalCategory || !projectId) {
            toast({
                title: "Missing Fields",
                description: "Please fill out all required fields.",
                variant: "destructive"
            })
            return;
        }

        onSave({
            date: date.toISOString(),
            description,
            amount,
            type,
            category: finalCategory,
            projectId,
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Project Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="grid gap-2">
                    <Label>Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger><SelectValue placeholder="Select a project task..." /></SelectTrigger>
                        <SelectContent>
                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} placeholder="0.00"/>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                 <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            <SelectItem value="new">-- Create New --</SelectItem>
                        </SelectContent>
                    </Select>
                    {category === 'new' && (
                        <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" className="mt-2" />
                    )}
                </div>
                <div className="grid gap-2">
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn(!date && 'text-muted-foreground', "justify-start text-left font-normal")}>
                                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus /></PopoverContent>
                    </Popover>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleSave}>Save Transaction</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}


export function ProjectBudgetView() {
    const { board } = useProjects();
    const { transactions, addTransaction, removeTransaction } = useFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();

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
    
    const projectList = useMemo(() => Object.values(board.tasks).map(t => ({id: t.id, title: t.title})), [board.tasks]);

    const handleSaveTransaction = (transaction: Omit<Transaction, 'id'>) => {
        addTransaction(transaction);
        toast({ title: "Transaction Added", description: `Added ${transaction.description} for $${transaction.amount}.`})
        setIsFormOpen(false);
    };

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Project Bookkeeping</CardTitle>
                        <CardDescription>A summary of all financial transactions linked to your projects.</CardDescription>
                    </div>
                     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2"/>Add Transaction</Button>
                        </DialogTrigger>
                        <TransactionForm onSave={handleSaveTransaction} projects={projectList} />
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {Object.keys(projectTotals).length > 0 ? (
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
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <Banknote className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">No project transactions yet.</h3>
                            <p className="mt-1 text-sm">Link transactions to projects to see a financial summary here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {projectTransactions.length > 0 && (
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
                                    <TableHead className="w-[50px]"></TableHead>
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
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeTransaction(t.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    
