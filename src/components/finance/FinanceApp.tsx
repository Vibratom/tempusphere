
'use client';

import React, { useState, useMemo } from 'react';
import { useFinance, Transaction, TransactionType, Budget } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, MoreVertical, Banknote, ArrowDown, ArrowUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProjects } from '@/contexts/ProjectsContext';
import { Progress } from '../ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Legend, Cell } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const COLORS = ['#16a34a', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#d946ef', '#14b8a6', '#eab308'];


function TransactionForm({ onSave, transaction, projects }: { onSave: (t: Omit<Transaction, 'id'>, id?: string) => void, transaction?: Transaction | null, projects: { id: string, title: string }[] }) {
    const { categories, addCategory } = useFinance();
    const [date, setDate] = useState<Date>(transaction ? parseISO(transaction.date) : new Date());
    const [description, setDescription] = useState(transaction?.description || '');
    const [amount, setAmount] = useState(transaction?.amount || 0);
    const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
    const [category, setCategory] = useState(transaction?.category || '');
    const [newCategory, setNewCategory] = useState('');
    const [projectId, setProjectId] = useState<string | undefined>(transaction?.projectId);

    const handleSave = () => {
        let finalCategory = category;
        if (category === 'new' && newCategory.trim()) {
            addCategory(newCategory.trim());
            finalCategory = newCategory.trim();
        }
        
        if (!description || amount <= 0 || !finalCategory) {
            // Add better validation feedback in a real app
            return;
        }

        onSave({
            date: date.toISOString(),
            description,
            amount,
            type,
            category: finalCategory,
            projectId,
        }, transaction?.id);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{transaction ? 'Edit' : 'Add'} Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} placeholder="0.00"/>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
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
                        <Label>Project (Optional)</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger><SelectValue placeholder="Link to a project..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-- No Project --</SelectItem>
                                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
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

function BudgetForm({ onSave, budget }: { onSave: (b: Omit<Budget, 'id'>, id?: string) => void, budget?: Budget | null }) {
    const { categories } = useFinance();
    const [amount, setAmount] = useState(budget?.amount || 0);
    const [category, setCategory] = useState(budget?.category || '');
    const [period, setPeriod] = useState<'monthly' | 'yearly'>(budget?.period || 'monthly');

    const handleSave = () => {
        if (amount > 0 && category) {
            onSave({ amount, category, period }, budget?.id);
        }
    }

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>{budget ? 'Edit' : 'Create'} Budget</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label>Amount</Label>
                    <Input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} placeholder="0.00" />
                </div>
                 <div className="grid gap-2">
                    <Label>Period</Label>
                    <Select value={period} onValueChange={v => setPeriod(v as 'monthly' | 'yearly')}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button onClick={handleSave}>Save Budget</Button>
                 </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export function FinanceApp() {
    const { 
        transactions, addTransaction, removeTransaction, updateTransaction,
        budgets, addBudget, removeBudget, updateBudget
    } = useFinance();
    const { board } = useProjects();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const handleSaveTransaction = (transaction: Omit<Transaction, 'id'>, id?: string) => {
        if(id) {
            updateTransaction({ ...transaction, id });
            toast({ title: "Transaction Updated" });
        } else {
            addTransaction(transaction);
            toast({ title: "Transaction Added" });
        }
        setIsFormOpen(false);
        setEditingTransaction(null);
    };

     const handleSaveBudget = (budget: Omit<Budget, 'id'>, id?: string) => {
        if(id) {
            updateBudget({ ...budget, id });
            toast({ title: "Budget Updated" });
        } else {
            addBudget(budget);
            toast({ title: "Budget Created" });
        }
        setIsBudgetFormOpen(false);
        setEditingBudget(null);
    };
    
    const projectList = useMemo(() => Object.values(board.tasks).map(t => ({id: t.id, title: t.title})), [board.tasks]);

    const financialSummary = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpense += t.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [transactions]);
    
    const expenseByCategory = useMemo(() => {
        const data = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
        
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    const getBudgetSpending = (budget: Budget) => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        return transactions
            .filter(t => t.type === 'expense' && t.category === budget.category && isWithinInterval(parseISO(t.date), { start, end }))
            .reduce((sum, t) => sum + t.amount, 0);
    }
    
    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col items-center text-center mb-4">
                <Banknote className="w-16 h-16 mb-4 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Finance Dashboard</h1>
                <p className="text-lg text-muted-foreground mt-2">Your central hub for tracking income, expenses, and budgets.</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ArrowUp className="text-green-500"/> Total Income</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-green-500">${financialSummary.totalIncome.toFixed(2)}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ArrowDown className="text-red-500"/> Total Expenses</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-red-500">${financialSummary.totalExpense.toFixed(2)}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Net Balance</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">${(financialSummary.totalIncome - financialSummary.totalExpense).toFixed(2)}</p></CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                 {/* Budget Section */}
                 <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Budgets</CardTitle>
                            <CardDescription>Track your monthly spending goals.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => { setEditingBudget(null); setIsBudgetFormOpen(true); }}><Plus className="mr-2"/>New Budget</Button>
                    </CardHeader>
                    <CardContent>
                        {budgets.length > 0 ? (
                             <div className="space-y-4">
                                {budgets.map(budget => {
                                    const spent = getBudgetSpending(budget);
                                    const progress = (spent / budget.amount) * 100;
                                    return (
                                        <div key={budget.id} className="space-y-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium">{budget.category}</span>
                                                <span className="text-muted-foreground">${spent.toFixed(2)} / ${budget.amount.toFixed(2)}</span>
                                            </div>
                                            <Progress value={progress} className={progress > 100 ? '[&>div]:bg-destructive' : ''}/>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No budgets set.</p>
                        )}
                    </CardContent>
                </Card>
                
                {/* Expense Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                        <CardDescription>A visual breakdown of your spending.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-64 w-full">
                           {expenseByCategory.length > 0 ? (
                             <ResponsiveContainer>
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                        {expenseByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                           ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">No expense data available.</div>
                           )}
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>A log of all your income and expenses.</CardDescription>
                    </div>
                    <Button onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}><Plus className="mr-2"/>Add Transaction</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map(t => (
                            <TableRow key={t.id}>
                                <TableCell>{format(parseISO(t.date), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="font-medium">{t.description}</TableCell>
                                <TableCell>{t.category}</TableCell>
                                <TableCell className="text-muted-foreground">{t.projectId ? board.tasks[t.projectId]?.title : 'N/A'}</TableCell>
                                <TableCell className={`text-right font-mono ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreVertical/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => {setEditingTransaction(t); setIsFormOpen(true);}}><Edit className="mr-2"/>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => removeTransaction(t.id)} className="text-destructive"><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <TransactionForm onSave={handleSaveTransaction} transaction={editingTransaction} projects={projectList} />
            </Dialog>

            <Dialog open={isBudgetFormOpen} onOpenChange={setIsBudgetFormOpen}>
                 <BudgetForm onSave={handleSaveBudget} budget={editingBudget} />
            </Dialog>
        </div>
    );
}

    