
'use client';

import React, { useState } from 'react';
import { useFinance, Budget } from '@/contexts/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

function BudgetForm({ onSave, budgetToEdit }: { onSave: (b: Omit<Budget, 'id'>) => void, budgetToEdit?: Budget }) {
    const { categories, addCategory } = useFinance();
    const [amount, setAmount] = useState(budgetToEdit?.amount || 0);
    const [category, setCategory] = useState(budgetToEdit?.category || '');
    const [newCategory, setNewCategory] = useState('');
    const [period, setPeriod] = useState<'monthly' | 'yearly'>(budgetToEdit?.period || 'monthly');
    const { toast } = useToast();

    const handleSave = () => {
        let finalCategory = category;
        if (category === 'new' && newCategory.trim()) {
            addCategory(newCategory.trim());
            finalCategory = newCategory.trim();
        }
        
        if (amount <= 0 || !finalCategory) {
            toast({ title: "Missing Fields", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }

        onSave({ amount, category: finalCategory, period });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{budgetToEdit ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            value={amount || ''} 
                            onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
                            placeholder="500.00"
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label>Period</Label>
                        <Select value={period} onValueChange={(v) => setPeriod(v as 'monthly' | 'yearly')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleSave}>Save Budget</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}


export function FinanceBudget() {
    const { budgets, addBudget, removeBudget, updateBudget } = useFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | undefined>(undefined);
    const { toast } = useToast();
    
    const handleSaveBudget = (budget: Omit<Budget, 'id'>) => {
        if(budgetToEdit) {
            updateBudget({ ...budgetToEdit, ...budget });
            toast({ title: "Budget Updated" });
        } else {
            addBudget(budget);
            toast({ title: "Budget Added" });
        }
        setIsFormOpen(false);
        setBudgetToEdit(undefined);
    };

    const openEditForm = (budget: Budget) => {
        setBudgetToEdit(budget);
        setIsFormOpen(true);
    }
    
    const openAddForm = () => {
        setBudgetToEdit(undefined);
        setIsFormOpen(true);
    }

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Budgets</CardTitle>
                    <CardDescription>Set monthly or yearly spending limits for your transaction categories.</CardDescription>
                </div>
                 <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) setBudgetToEdit(undefined); setIsFormOpen(isOpen); }}>
                    <Button onClick={openAddForm}><Plus className="mr-2"/>Add Budget</Button>
                    <BudgetForm onSave={handleSaveBudget} budgetToEdit={budgetToEdit} />
                 </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {budgets.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No budgets set yet.</TableCell>
                            </TableRow>
                        ) : budgets.map(b => (
                            <TableRow key={b.id}>
                                <TableCell className="font-medium">{b.category}</TableCell>
                                <TableCell>${b.amount.toFixed(2)}</TableCell>
                                <TableCell className="capitalize">{b.period}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditForm(b)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" onClick={() => removeBudget(b.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
