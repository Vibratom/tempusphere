
'use client';

import React, { useState, useMemo } from 'react';
import { useFinance, Transaction, TransactionType, TransactionStatus } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, MoreVertical, Banknote, ArrowDown, ArrowUp, FileText, FilePlus, HandCoins } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProjects } from '@/contexts/ProjectsContext';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Legend, Cell, Tooltip } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';


const COLORS = ['#16a34a', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#d946ef', '#14b8a6', '#eab308'];


function TransactionForm({ onSave, transaction, projects }: { onSave: (t: Omit<Transaction, 'id'>, id?: string) => void, transaction?: Transaction | null, projects: { id: string, title: string }[] }) {
    const { categories, addCategory } = useFinance();
    const [date, setDate] = useState<Date>(transaction ? parseISO(transaction.date) : new Date());
    const [description, setDescription] = useState(transaction?.description || '');
    const [amount, setAmount] = useState(transaction?.amount || 0);
    const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
    const [status, setStatus] = useState<TransactionStatus>(transaction?.status || 'unpaid');
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
            status,
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
                <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as TransactionStatus)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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

export function FinanceApp() {
    const { 
        transactions, addTransaction, removeTransaction, updateTransaction,
    } = useFinance();
    const { board } = useProjects();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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
    
    const projectList = useMemo(() => Object.values(board.tasks).map(t => ({id: t.id, title: t.title})), [board.tasks]);

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

    const expenseByCategory = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const byCategory = expenses.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = { name: t.category, value: 0 };
            }
            acc[t.category].value += t.amount;
            return acc;
        }, {} as Record<string, {name: string, value: number}>);
        return Object.values(byCategory);
    }, [transactions]);
    
    const markAsPaid = (transaction: Transaction) => {
        updateTransaction({ ...transaction, status: 'paid' });
        toast({ title: 'Transaction marked as paid.'});
    }

    const statusBadge = (status: TransactionStatus, date: string) => {
        const isOverdue = status === 'unpaid' && isPast(parseISO(date));
        const finalStatus = isOverdue ? 'overdue' : status;

        return <Badge variant={finalStatus === 'paid' ? 'secondary' : 'default'} className={cn(
            finalStatus === 'paid' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            finalStatus === 'unpaid' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            finalStatus === 'overdue' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        )}>{finalStatus}</Badge>
    }
    
    return (
        <div className="w-full flex flex-col gap-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                 <Card>
                    <CardHeader><CardTitle>A/P vs A/R</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Receivable</p>
                                <p className="text-lg font-bold text-green-500">${accountsReceivable.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                            </div>
                             <div className="text-center">
                                <p className="text-sm text-muted-foreground">Payable</p>
                                <p className="text-lg font-bold text-red-500">${accountsPayable.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <Tabs defaultValue="ledger">
                        <div className="flex justify-between items-center mb-4">
                            <TabsList>
                                <TabsTrigger value="ledger"><FileText className="mr-2"/>Ledger</TabsTrigger>
                                <TabsTrigger value="receivable"><FilePlus className="mr-2"/>Receivable</TabsTrigger>
                                <TabsTrigger value="payable"><HandCoins className="mr-2"/>Payable</TabsTrigger>
                            </TabsList>
                            <Button onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}><Plus className="mr-2"/>Add Transaction</Button>
                        </div>
                        <TabsContent value="ledger">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Status</TableHead>
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
                                                <TableCell>{statusBadge(t.status, t.date)}</TableCell>
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
                        </TabsContent>
                        <TabsContent value="receivable">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="w-[120px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accountsReceivable.map(t => (
                                                <TableRow key={t.id}>
                                                    <TableCell>{format(parseISO(t.date), 'MMM d, yyyy')}</TableCell>
                                                    <TableCell className="font-medium">{t.description}</TableCell>
                                                    <TableCell>{statusBadge(t.status, t.date)}</TableCell>
                                                    <TableCell className="text-right font-mono text-green-500">+${t.amount.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Button size="sm" onClick={() => markAsPaid(t)}>Mark as Paid</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="payable">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="w-[120px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accountsPayable.map(t => (
                                                <TableRow key={t.id}>
                                                    <TableCell>{format(parseISO(t.date), 'MMM d, yyyy')}</TableCell>
                                                    <TableCell className="font-medium">{t.description}</TableCell>
                                                    <TableCell>{statusBadge(t.status, t.date)}</TableCell>
                                                    <TableCell className="text-right font-mono text-red-500">-${t.amount.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Button size="sm" onClick={() => markAsPaid(t)}>Mark as Paid</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Expense Breakdown</CardTitle>
                            <CardDescription>Spending by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="h-64 w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                             {expenseByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend iconType="circle"/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <TransactionForm onSave={handleSaveTransaction} transaction={editingTransaction} projects={projectList} />
            </Dialog>

        </div>
    );
}

    