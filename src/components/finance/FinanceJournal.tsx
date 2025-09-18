
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction, TransactionType, TransactionStatus } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Trash2, Edit, MoreVertical, FileText, FilePlus, HandCoins, BookCopy, ArrowRight, Wallet, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from '../ui/dialog';
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
import { useLocalStorage } from '@/hooks/use-local-storage';
import { journalTemplates, JournalTemplate } from '@/lib/journal-templates';
import { ScrollArea } from '../ui/scroll-area';

interface JournalEntry {
    id: string;
    date: string;
    description: string;
    entries: {
        account: string;
        debit: number;
        credit: number;
    }[];
}

interface AllocationEntry {
    id: string;
    account: string;
    amount: number;
}

function JournalForm({ onSave, template }: { onSave: (entry: Omit<JournalEntry, 'id'>) => void, template?: JournalTemplate }) {
    const { categories, addCategory } = useFinance();
    const [date, setDate] = useState<Date>(new Date());
    const [description, setDescription] = useState(template?.name || '');
    const [totalAmount, setTotalAmount] = useState(0);

    const [sources, setSources] = useState<AllocationEntry[]>(template?.credit.map((c, i) => ({ id: `s-${i}`, account: c, amount: 0 })) || [{ id: `s-${Date.now()}`, account: '', amount: 0 }]);
    const [destinations, setDestinations] = useState<AllocationEntry[]>(template?.debit.map((d, i) => ({ id: `d-${i}`, account: d, amount: 0 })) || [{ id: `d-${Date.now()}`, account: '', amount: 0 }]);

    const { toast } = useToast();
    
    useEffect(() => {
        if (template) {
            setDescription(template.name);
            setSources(template.credit.map((c, i) => ({ id: `s-${i}`, account: c, amount: 0 })));
            setDestinations(template.debit.map((d, i) => ({ id: `d-${i}`, account: d, amount: 0 })));
            
            const allTemplateAccounts = [...template.credit, ...template.debit];
            allTemplateAccounts.forEach(acc => {
                if(!categories.includes(acc)) {
                    addCategory(acc);
                }
            });
        } else {
            // Reset to default when there's no template
            setDescription('');
            setSources([{ id: `s-${Date.now()}`, account: '', amount: 0 }]);
            setDestinations([{ id: `d-${Date.now()}`, account: '', amount: 0 }]);
        }
    }, [template, addCategory, categories]);


    const handleAllocationChange = (type: 'source' | 'destination', index: number, field: 'account' | 'amount', value: string | number) => {
        const list = type === 'source' ? sources : destinations;
        const setter = type === 'source' ? setSources : setDestinations;
        
        const newList = [...list];
        const entry = { ...newList[index] };
        
        if (field === 'account') entry.account = value as string;
        if (field === 'amount') entry.amount = Number(value) || 0;
        
        newList[index] = entry;
        setter(newList);
    };

    const addAllocationRow = (type: 'source' | 'destination') => {
        const setter = type === 'source' ? setSources : setDestinations;
        setter(prev => [...prev, { id: `${type === 'source' ? 's' : 'd'}-${Date.now()}`, account: '', amount: 0 }]);
    };

    const removeAllocationRow = (type: 'source' | 'destination', id: string) => {
        const list = type === 'source' ? sources : destinations;
        const setter = type === 'source' ? setSources : setDestinations;
        if (list.length > 1) {
            setter(list.filter(item => item.id !== id));
        }
    };
    
    const { totalSource, totalDestination, isBalanced } = useMemo(() => {
        const sourceSum = sources.reduce((sum, s) => sum + s.amount, 0);
        const destSum = destinations.reduce((sum, d) => sum + d.amount, 0);
        const balanced = totalAmount > 0 && sourceSum === totalAmount && destSum === totalAmount;
        return { totalSource: sourceSum, totalDestination: destSum, isBalanced: balanced };
    }, [sources, destinations, totalAmount]);
    
     const autoFill = (type: 'source' | 'destination') => {
        const list = type === 'source' ? sources : destinations;
        const setter = type === 'source' ? setSources : setDestinations;
        const totalAllocated = list.reduce((sum, item) => sum + item.amount, 0);
        const firstEmpty = list.find(item => item.amount === 0);

        if (firstEmpty) {
            const remainder = totalAmount - totalAllocated;
            handleAllocationChange(type, list.findIndex(i => i.id === firstEmpty.id), 'amount', remainder);
        }
    };

    const handleSave = () => {
        if (!description || !isBalanced || sources.some(e => !e.account) || destinations.some(e => !e.account)) {
             toast({
                title: "Invalid Entry",
                description: "Please fill the description, ensure the transaction is balanced, and all accounts are selected.",
                variant: "destructive"
            });
            return;
        }
        
        const journalEntries = [
            ...sources.map(s => ({ account: s.account, debit: 0, credit: s.amount })),
            ...destinations.map(d => ({ account: d.account, debit: d.amount, credit: 0 })),
        ];
        
        onSave({ date: date.toISOString(), description, entries: journalEntries });
    };

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
                <DialogDescription>
                    Record a financial transaction. Enter the total amount, then specify where the money came from and where it went.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Office supply purchase"/>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="totalAmount">Total Amount</Label>
                        <Input id="totalAmount" type="number" value={totalAmount || ''} onChange={e => setTotalAmount(Number(e.target.value))} placeholder="100.00" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* --- SOURCES --- */}
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="font-semibold text-center">Money Came From (Source / Credit)</h4>
                        {sources.map((entry, index) => (
                             <div key={entry.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-7">
                                    <Select value={entry.account} onValueChange={(v) => handleAllocationChange('source', index, 'account', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-4">
                                    <Input type="number" placeholder="Amount" value={entry.amount || ''} onChange={e => handleAllocationChange('source', index, 'amount', e.target.value)} />
                                </div>
                                 <div className="col-span-1">
                                    <Button size="icon" variant="ghost" onClick={() => removeAllocationRow('source', entry.id)} disabled={sources.length <= 1}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addAllocationRow('source')}><Plus className="mr-2 h-4 w-4"/>Add Source</Button>
                        <div className="font-mono font-bold border-t pt-2 mt-2 text-right pr-2 flex justify-between items-center">
                            <span>Total Source:</span>
                             <span className={cn(totalSource !== totalAmount && "text-destructive")}>${totalSource.toFixed(2)}</span>
                        </div>
                        {totalAmount > 0 && totalSource < totalAmount && <Button size="sm" variant="secondary" onClick={() => autoFill('source')}>Auto-fill</Button>}
                    </div>
                    
                    {/* --- DESTINATIONS --- */}
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="font-semibold text-center">Money Went To (Destination / Debit)</h4>
                        {destinations.map((entry, index) => (
                             <div key={entry.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-7">
                                    <Select value={entry.account} onValueChange={(v) => handleAllocationChange('destination', index, 'account', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-4">
                                    <Input type="number" placeholder="Amount" value={entry.amount || ''} onChange={e => handleAllocationChange('destination', index, 'amount', e.target.value)} />
                                </div>
                                 <div className="col-span-1">
                                    <Button size="icon" variant="ghost" onClick={() => removeAllocationRow('destination', entry.id)} disabled={destinations.length <= 1}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addAllocationRow('destination')}><Plus className="mr-2 h-4 w-4"/>Add Destination</Button>
                         <div className="font-mono font-bold border-t pt-2 mt-2 text-right pr-2 flex justify-between items-center">
                            <span>Total Destination:</span>
                            <span className={cn(totalDestination !== totalAmount && "text-destructive")}>${totalDestination.toFixed(2)}</span>
                        </div>
                        {totalAmount > 0 && totalDestination < totalAmount && <Button size="sm" variant="secondary" onClick={() => autoFill('destination')}>Auto-fill</Button>}
                    </div>
                </div>
                 <div className="flex items-center justify-center p-4 rounded-lg text-lg font-bold gap-4"
                    style={{ background: isBalanced ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)', color: isBalanced ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}
                 >
                    <span>${totalSource.toFixed(2)}</span>
                    <ArrowRight />
                    <span>${totalDestination.toFixed(2)}</span>
                    <Badge variant={isBalanced ? 'default' : 'destructive'} className="ml-4">{isBalanced ? 'Balanced' : 'Unbalanced'}</Badge>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleSave} disabled={!isBalanced}>Save Entry</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

function JournalTemplateSelector({ onSelect, onCustom }: { onSelect: (template: JournalTemplate) => void, onCustom: () => void }) {
    const [search, setSearch] = useState('');
    const filteredTemplates = journalTemplates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
                <DialogDescription>Select a transaction template or create a custom entry.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8"/>
                </div>
                <Button variant="outline" onClick={onCustom}>Custom Entry</Button>
            </div>
            <ScrollArea className="h-[60vh]">
                <div className="pr-4 space-y-2">
                    {filteredTemplates.map((template, index) => (
                        <Card key={`${template.name}-${index}`} className="hover:bg-muted/50 cursor-pointer" onClick={() => onSelect(template)}>
                            <CardHeader className="p-3">
                                <CardTitle className="text-base">{template.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
    )
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

export function FinanceJournal() {
    const { transactions, addTransaction, removeTransaction, updateTransaction } = useFinance();
    const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('finance:journalEntriesV1', []);
    
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | undefined>(undefined);
    
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('journal');
    
    const handleSaveJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
        entry.entries.forEach(e => {
            if (e.debit > 0 || e.credit > 0) {
                addTransaction({
                    date: entry.date,
                    description: entry.description,
                    amount: e.debit || e.credit,
                    type: e.credit > 0 ? 'income' : 'expense',
                    status: 'paid', // Journal entries are considered recorded and thus 'paid'
                    category: e.account,
                })
            }
        });
        
        const newJournalEntry: JournalEntry = { id: `je-${Date.now()}`, ...entry };
        setJournalEntries(prev => [newJournalEntry, ...prev]);

        toast({ title: "Journal Entry Recorded" });
        setIsFormOpen(false);
        setSelectedTemplate(undefined);
    }
    
    const handleTemplateSelect = (template: JournalTemplate) => {
        setSelectedTemplate(template);
        setIsSelectorOpen(false);
        setIsFormOpen(true);
    };

    const handleCustomEntry = () => {
        setSelectedTemplate(undefined);
        setIsSelectorOpen(false);
        setIsFormOpen(true);
    }

    const { accountsReceivable, accountsPayable } = useMemo(() => {
        const ar = transactions.filter(t => t.type === 'income' && t.status !== 'paid');
        const ap = transactions.filter(t => t.type === 'expense' && t.status !== 'paid');
        return { accountsReceivable: ar, accountsPayable: ap };
    }, [transactions]);
    
    const markAsPaid = (transaction: Transaction) => {
        updateTransaction({ ...transaction, status: 'paid' });
        toast({ title: 'Transaction marked as paid.'});
    }
    
    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Financial Records</CardTitle>
                    <CardDescription>Manage journal entries, view the ledger, and track receivables/payables.</CardDescription>
                </div>
                 <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2"/>New Journal Entry</Button>
                    </DialogTrigger>
                    <JournalTemplateSelector onSelect={handleTemplateSelect} onCustom={handleCustomEntry} />
                 </Dialog>
                 <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) setSelectedTemplate(undefined); setIsFormOpen(open); }}>
                    <JournalForm onSave={handleSaveJournalEntry} template={selectedTemplate} />
                 </Dialog>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 grid w-full grid-cols-4">
                        <TabsTrigger value="journal"><BookCopy className="mr-2"/>Journal</TabsTrigger>
                        <TabsTrigger value="ledger"><FileText className="mr-2"/>Ledger</TabsTrigger>
                        <TabsTrigger value="receivable"><FilePlus className="mr-2"/>Receivable</TabsTrigger>
                        <TabsTrigger value="payable"><HandCoins className="mr-2"/>Payable</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="journal" className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journalEntries.length === 0 ? (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No journal entries yet.</TableCell>
                                    </TableRow>
                                ) : journalEntries.map((je) => (
                                   je.entries.map((entry, entryIndex) => (
                                     <TableRow key={`${je.id}-${entryIndex}`} className={cn(entryIndex === je.entries.length - 1 && "border-b-4")}>
                                        <TableCell className={cn(entryIndex !== 0 && "border-t-0")}>{entryIndex === 0 ? format(parseISO(je.date), 'MMM d, yyyy') : ''}</TableCell>
                                        <TableCell className={cn(entryIndex !== 0 && "border-t-0")}>{entryIndex === 0 ? je.description : ''}</TableCell>
                                        <TableCell className="pl-8">{entry.account}</TableCell>
                                        <TableCell className="text-right font-mono">{entry.debit ? entry.debit.toFixed(2) : ''}</TableCell>
                                        <TableCell className="text-right font-mono">{entry.credit ? entry.credit.toFixed(2) : ''}</TableCell>
                                     </TableRow>
                                   ))
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    
                    <TabsContent value="ledger" className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
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
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    
                    <TabsContent value="receivable" className="p-0">
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
                    </TabsContent>
                    
                     <TabsContent value="payable" className="p-0">
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
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

    

    
