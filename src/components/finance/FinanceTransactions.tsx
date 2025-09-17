
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction, TransactionType, TransactionStatus } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, MoreVertical, FileText, FilePlus, HandCoins } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProjects } from '@/contexts/ProjectsContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

function TransactionForm({ onSave, transaction, projects, onDone }: { onSave: (t: Omit<Transaction, 'id'>, id?: string) => void, transaction?: Transaction | null, projects: { id: string, title: string }[], onDone?: () => void }) {
    const { categories, addCategory } = useFinance();
    const [date, setDate] = useState<Date | undefined>(transaction ? parseISO(transaction.date) : new Date());
    const [description, setDescription] = useState(transaction?.description || '');
    const [amount, setAmount] = useState<number | ''>(transaction?.amount || '');
    const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
    const [status, setStatus] = useState<TransactionStatus>(transaction?.status || 'unpaid');
    const [category, setCategory] = useState(transaction?.category || '');
    const [newCategory, setNewCategory] = useState('');
    const [projectId, setProjectId] = useState<string | undefined>(transaction?.projectId);

    useEffect(() => {
        if (transaction) {
            setDate(parseISO(transaction.date));
            setDescription(transaction.description);
            setAmount(transaction.amount);
            setType(transaction.type);
            setStatus(transaction.status);
            setCategory(transaction.category);
            setProjectId(transaction.projectId);
        } else {
            setDate(new Date());
            setDescription('');
            setAmount('');
            setType('expense');
            setStatus('unpaid');
            setCategory('');
            setProjectId(undefined);
            setNewCategory('');
        }
    }, [transaction]);

    const handleSave = () => {
        let finalCategory = category;
        if (category === 'new' && newCategory.trim()) {
            addCategory(newCategory.trim());
            finalCategory = newCategory.trim();
        }
        
        if (!description || !amount || !finalCategory || !date) {
            return;
        }

        onSave({
            date: date.toISOString(),
            description,
            amount: +amount,
            type,
            status,
            category: finalCategory,
            projectId: projectId === 'none' ? undefined : projectId,
        }, transaction?.id);

        if (onDone) onDone();
    };
    
    const FormWrapper = transaction ? DialogContent : 'div';
    const FormActions = transaction ? DialogFooter : 'div';

    return (
        <FormWrapper className={cn(!transaction && "pt-6")}>
            {transaction && <DialogHeader><DialogTitle>{transaction ? 'Edit' : 'Add'} Transaction</DialogTitle></DialogHeader>}
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
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="0.00"/>
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
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
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
            <FormActions>
                <Button onClick={handleSave}>Save Transaction</Button>
            </FormActions>
        </FormWrapper>
    );
}

export function FinanceTransactions() {
    const { 
        transactions, addTransaction, removeTransaction, updateTransaction,
    } = useFinance();
    const { board } = useProjects();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState('ledger');

    useEffect(() => {
        setIsClient(true);
    }, []);

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

    const { accountsReceivable, accountsPayable } = useMemo(() => {
        const ar = transactions.filter(t => t.type === 'income' && t.status !== 'paid');
        const ap = transactions.filter(t => t.type === 'expense' && t.status !== 'paid');
        return { accountsReceivable: ar, accountsPayable: ap };
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

    if (!isClient) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        )
    }
    
    return (
        <div className="w-full flex flex-col gap-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 grid w-full grid-cols-4">
                    <TabsTrigger value="ledger"><FileText className="mr-2"/>Ledger</TabsTrigger>
                    <TabsTrigger value="receivable"><FilePlus className="mr-2"/>Receivable</TabsTrigger>
                    <TabsTrigger value="payable"><HandCoins className="mr-2"/>Payable</TabsTrigger>
                    <TabsTrigger value="add"><Plus className="mr-2"/>New Transaction</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ledger">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Ledger</CardTitle>
                            <CardDescription>A complete record of all financial transactions.</CardDescription>
                        </CardHeader>
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
                        <CardHeader>
                            <CardTitle>Accounts Receivable</CardTitle>
                            <CardDescription>Money owed to you that has not yet been paid.</CardDescription>
                        </CardHeader>
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
                         <CardHeader>
                            <CardTitle>Accounts Payable</CardTitle>
                            <CardDescription>Money you owe that has not yet been paid.</CardDescription>
                        </CardHeader>
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
                <TabsContent value="add">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add a New Transaction</CardTitle>
                            <CardDescription>Record a new income or expense item.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TransactionForm onSave={handleSaveTransaction} projects={projectList} onDone={() => setActiveTab('ledger')} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <TransactionForm onSave={handleSaveTransaction} transaction={editingTransaction} projects={projectList} onDone={() => setIsFormOpen(false)} />
            </Dialog>
        </div>
    );
}
