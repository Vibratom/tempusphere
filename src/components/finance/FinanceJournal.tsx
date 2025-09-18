
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction, TransactionType } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

function JournalForm({ onSave }: { onSave: (entry: Omit<JournalEntry, 'id'>) => void }) {
    const { categories, addCategory } = useFinance();
    const [date, setDate] = useState<Date>(new Date());
    const [description, setDescription] = useState('');
    const [entries, setEntries] = useState([
        { account: '', debit: 0, credit: 0 },
        { account: '', debit: 0, credit: 0 },
    ]);
    const { toast } = useToast();

    const handleEntryChange = (index: number, field: 'account' | 'debit' | 'credit', value: string | number) => {
        const newEntries = [...entries];
        const entry = { ...newEntries[index] };
        
        if(field === 'account') entry.account = value as string;
        if(field === 'debit') {
            entry.debit = Number(value);
            if (Number(value) > 0) entry.credit = 0;
        }
        if(field === 'credit') {
            entry.credit = Number(value);
             if (Number(value) > 0) entry.debit = 0;
        }
        
        newEntries[index] = entry;
        setEntries(newEntries);
    };

    const addEntryRow = () => {
        setEntries([...entries, { account: '', debit: 0, credit: 0 }]);
    }
    
    const removeEntryRow = (index: number) => {
        if(entries.length > 2) {
            setEntries(entries.filter((_, i) => i !== index));
        }
    }

    const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
        return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit && totalDebit > 0 };
    }, [entries]);

    const handleSave = () => {
        if (!description || !isBalanced || entries.some(e => !e.account)) {
             toast({
                title: "Invalid Entry",
                description: "Description must be filled, debits must equal credits, and all accounts must be selected.",
                variant: "destructive"
            });
            return;
        }
        onSave({ date: date.toISOString(), description, entries });
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
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
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    {entries.map((entry, index) => (
                         <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                                <Select value={entry.account} onValueChange={(v) => handleEntryChange(index, 'account', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-3">
                                <Input type="number" placeholder="Debit" value={entry.debit || ''} onChange={e => handleEntryChange(index, 'debit', e.target.value)} />
                            </div>
                            <div className="col-span-3">
                                <Input type="number" placeholder="Credit" value={entry.credit || ''} onChange={e => handleEntryChange(index, 'credit', e.target.value)} />
                            </div>
                             <div className="col-span-1">
                                <Button size="icon" variant="ghost" onClick={() => removeEntryRow(index)} disabled={entries.length <= 2}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addEntryRow}><Plus className="mr-2 h-4 w-4"/>Add Line</Button>
                </div>
                <div className="grid grid-cols-12 gap-2 font-mono font-bold border-t pt-2">
                    <div className="col-start-6 col-span-3 text-right pr-2">{totalDebit.toFixed(2)}</div>
                    <div className="col-span-3 text-right pr-2">{totalCredit.toFixed(2)}</div>
                    {!isBalanced && totalDebit > 0 && <div className="col-span-12 text-right text-destructive text-xs pr-2">Debits and credits must be equal.</div>}
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


export function FinanceJournal() {
    const { transactions, addTransaction } = useFinance();
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();
    
    const handleSaveJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
        // Create transactions from journal entry
        entry.entries.forEach(e => {
            if (e.debit > 0 || e.credit > 0) {
                // Simplified: treat debits as expenses and credits as income
                // This is not strictly correct accounting but fits the existing model.
                addTransaction({
                    date: entry.date,
                    description: entry.description,
                    amount: e.debit || e.credit,
                    type: e.credit > 0 ? 'income' : 'expense',
                    status: 'paid', // Journal entries are considered paid
                    category: e.account,
                })
            }
        });
        
        const newJournalEntry: JournalEntry = {
            id: `je-${Date.now()}`,
            ...entry,
        };
        setJournalEntries(prev => [newJournalEntry, ...prev]);

        toast({ title: "Journal Entry Recorded" });
        setIsFormOpen(false);
    }
    
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Journal</CardTitle>
                    <CardDescription>Record financial events with double-entry bookkeeping.</CardDescription>
                </div>
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2"/>New Entry</Button>
                    </DialogTrigger>
                    <JournalForm onSave={handleSaveJournalEntry} />
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
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
                                <TableCell colSpan={5} className="h-24 text-center">
                                No journal entries yet.
                                </TableCell>
                            </TableRow>
                        ) : journalEntries.map((je, jeIndex) => (
                           je.entries.map((entry, entryIndex) => (
                             <TableRow key={`${je.id}-${entryIndex}`} className={cn(entryIndex === je.entries.length - 1 && "border-b-4")}>
                                <TableCell className={cn(entryIndex !== 0 && "border-t-0")}>
                                    {entryIndex === 0 ? format(parseISO(je.date), 'MMM d, yyyy') : ''}
                                </TableCell>
                                <TableCell className={cn(entryIndex !== 0 && "border-t-0")}>
                                    {entryIndex === 0 ? je.description : ''}
                                </TableCell>
                                <TableCell className="pl-8">{entry.account}</TableCell>
                                <TableCell className="text-right font-mono">{entry.debit ? entry.debit.toFixed(2) : ''}</TableCell>
                                <TableCell className="text-right font-mono">{entry.credit ? entry.credit.toFixed(2) : ''}</TableCell>
                             </TableRow>
                           ))
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

