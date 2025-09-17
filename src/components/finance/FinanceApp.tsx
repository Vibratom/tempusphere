'use client';

import { useState, useMemo } from 'react';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { useProjects, TaskCard } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark, TrendingUp, PieChart, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const TransactionDialog = () => {
    const { addTransaction } = useFinance();
    const { board } = useProjects();
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [projectId, setProjectId] = useState<string | undefined>();
    
    const projectOptions = useMemo(() => {
        return Object.values(board.tasks).map(task => ({
            value: task.id,
            label: task.title,
        }));
    }, [board.tasks]);

    const handleSubmit = () => {
        if (!description || !amount || !date) {
            toast({ title: "Missing Fields", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }

        addTransaction({
            description,
            amount: parseFloat(amount),
            date,
            type,
            category: category || 'Uncategorized',
            projectId
        });
        
        toast({ title: "Transaction Added!", description: `Added ${description} for $${amount}.`});

        // Reset form
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setType('expense');
        setCategory('');
        setProjectId(undefined);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2"/>
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">Description</Label>
                        <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                         <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project" className="text-right">Project (Optional)</Label>
                         <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Link to a project task..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {projectOptions.map(p => (
                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Save Transaction</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function FinanceApp() {
  const { transactions, removeTransaction } = useFinance();
  const { board } = useProjects();
  
  const { totalBalance, monthlySpending } = useMemo(() => {
    let balance = 0;
    let spending = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    transactions.forEach(t => {
      if (t.type === 'income') {
        balance += t.amount;
      } else {
        balance -= t.amount;
      }
      
      const tDate = parseISO(t.date);
      if (t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          spending += t.amount;
      }
    });

    return { totalBalance: balance, monthlySpending: spending };
  }, [transactions]);
  
  const getProjectTitle = (projectId?: string) => {
    if(!projectId) return 'N/A';
    return board.tasks[projectId]?.title || 'Unknown Project';
  }


  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <Landmark className="w-16 h-16 mb-4 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Finance Hub</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-3xl">A central place to manage your financial life. Track expenses, create budgets, and visualize your spending.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Across {transactions.length} transactions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month's Spending</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${monthlySpending.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">In {format(new Date(), 'MMMM')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Budget Progress</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Not Set</div>
                <p className="text-xs text-muted-foreground">Create a budget to get started</p>
            </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Recent Transactions</CardTitle>
                <TransactionDialog />
              </div>
          </CardHeader>
          <CardContent>
              {transactions.length > 0 ? (
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
                    {transactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell>{format(parseISO(t.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell className="text-muted-foreground">{getProjectTitle(t.projectId)}</TableCell>
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
              ) : (
                 <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                    <Landmark className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">No Transactions Yet</h3>
                    <p className="text-sm">Add your first transaction to see it here.</p>
                </div>
              )}
          </CardContent>
          {transactions.length > 0 && (
            <CardFooter>
                <p className="text-xs text-muted-foreground">Showing all {transactions.length} transactions.</p>
            </CardFooter>
          )}
       </Card>
    </div>
  );
}
