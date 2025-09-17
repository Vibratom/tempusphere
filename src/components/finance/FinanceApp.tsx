
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance, Transaction, Budget } from '@/contexts/FinanceContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark, TrendingUp, PieChart, Plus, Trash2, Edit, MoreVertical, Target, BarChart, LineChart } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart as RechartsPieChart, Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];


const TransactionDialog = ({ transaction, onSave, onOpenChange, open, children }: { transaction?: Transaction | null, onSave: (t: Omit<Transaction, 'id'>, id?: string) => void, open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) => {
    const { board } = useProjects();
    const { categories, addCategory } = useFinance();
    const { toast } = useToast();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('Other');
    const [projectId, setProjectId] = useState<string | undefined>();
    
    useEffect(() => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setDate(transaction.date);
            setType(transaction.type);
            setCategory(transaction.category);
            setProjectId(transaction.projectId);
        } else {
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setType('expense');
            setCategory('Other');
            setProjectId(undefined);
        }
    }, [transaction]);

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

        addCategory(category); // Add category if it's new

        onSave({
            description,
            amount: parseFloat(amount),
            date,
            type,
            category,
            projectId
        }, transaction?.id);
        
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{transaction ? 'Edit' : 'Add'} Transaction</DialogTitle>
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
                        <Label htmlFor="category" className="text-right">Category</Label>
                         <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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

const BudgetForm = ({ onSave, budget }: { onSave: (b: Omit<Budget, 'id'>, id?: string) => void; budget?: Budget | null }) => {
    const { categories } = useFinance();
    const [category, setCategory] = useState(budget?.category || categories[0] || '');
    const [amount, setAmount] = useState(budget?.amount.toString() || '');
    const [period, setPeriod] = useState(budget?.period || 'monthly');

    const handleSave = () => {
        if (category && amount) {
            onSave({ category, amount: parseFloat(amount), period: period as 'monthly' | 'yearly' }, budget?.id);
            setCategory(categories[0] || '');
            setAmount('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{budget ? 'Edit' : 'Create'} Budget</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                 <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
                <Select value={period} onValueChange={(v:any) => setPeriod(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleSave}>{budget ? 'Update' : 'Add'} Budget</Button>
            </CardContent>
        </Card>
    );
};

export function FinanceApp() {
  const { transactions, addTransaction, removeTransaction, updateTransaction, budgets, addBudget, removeBudget, updateBudget } = useFinance();
  const { board } = useProjects();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { totalBalance, monthlySpending, monthlyBudgetTotal, monthlyBudgetProgress } = useMemo(() => {
    if (!isClient) {
        return { totalBalance: 0, monthlySpending: 0, monthlyBudgetTotal: 0, monthlyBudgetProgress: 0 };
    }

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

    const budgetTotal = budgets.reduce((sum, b) => b.period === 'monthly' ? sum + b.amount : sum, 0);
    const budgetProgress = budgetTotal > 0 ? (spending / budgetTotal) * 100 : 0;

    return { totalBalance: balance, monthlySpending: spending, monthlyBudgetTotal: budgetTotal, monthlyBudgetProgress: budgetProgress };
  }, [transactions, budgets, isClient]);

  const { monthlySpendingPerCategory, historicalData } = useMemo(() => {
    const spending: Record<string, number> = {};
    const history: Record<string, { income: number, expense: number }> = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    transactions.forEach(t => {
        const tDate = parseISO(t.date);
        
        // For pie chart (current month spending)
        if (t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        }

        // For bar chart (last 6 months)
        if(tDate >= sixMonthsAgo) {
            const monthKey = format(tDate, 'MMM yyyy');
            if(!history[monthKey]) history[monthKey] = { income: 0, expense: 0 };
            if(t.type === 'income') history[monthKey].income += t.amount;
            else history[monthKey].expense += t.amount;
        }
    });

    const spendingData = Object.entries(spending).map(([name, value]) => ({ name, value }));

    const historicalChartData = Object.entries(history)
        .map(([name, values]) => ({ name, ...values }))
        .sort((a,b) => parseISO(a.name).getTime() - parseISO(b.name).getTime());
        
    return { monthlySpendingPerCategory: spendingData, historicalData: historicalChartData };
  }, [transactions]);
  
  const getProjectTitle = (projectId?: string) => {
    if(!projectId) return 'N/A';
    return board.tasks[projectId]?.title || 'Unknown Project';
  }

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
        updateTransaction({ ...transactionData, id });
        toast({ title: "Transaction Updated!", description: `Updated ${transactionData.description}.`});
    } else {
        addTransaction(transactionData);
        toast({ title: "Transaction Added!", description: `Added ${transactionData.description}.`});
    }
  };

  const handleSaveBudget = (budgetData: Omit<Budget, 'id'>, id?: string) => {
    if (id) {
        updateBudget({ ...budgetData, id });
        toast({ title: "Budget Updated!"});
    } else {
        addBudget(budgetData);
        toast({ title: "Budget Added!"});
    }
  };


  const handleOpenDialog = (transaction: Transaction | null = null) => {
      setSelectedTransaction(transaction);
      setIsDialogOpen(true);
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
                <div className="text-2xl font-bold">${isClient ? totalBalance.toFixed(2) : '0.00'}</div>
                {isClient && <p className="text-xs text-muted-foreground">Across {transactions.length} transactions</p>}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month's Spending</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${isClient ? monthlySpending.toFixed(2) : '0.00'}</div>
                {isClient && <p className="text-xs text-muted-foreground">In {format(new Date(), 'MMMM')}</p>}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isClient && monthlyBudgetTotal > 0 ? (
                    <>
                      <div className="text-2xl font-bold">${monthlySpending.toFixed(2)} / ${monthlyBudgetTotal.toFixed(2)}</div>
                      <Progress value={monthlyBudgetProgress} className="mt-2" />
                    </>
                ) : (
                   <>
                    <div className="text-2xl font-bold">Not Set</div>
                    <p className="text-xs text-muted-foreground">Create a budget to get started</p>
                   </>
                )}
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>This Month's Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {monthlySpendingPerCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <RechartsTooltip contentStyle={{ background: "hsl(var(--background))" }}/>
                                    <Legend />
                                    <Pie data={monthlySpendingPerCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {monthlySpendingPerCategory.map((entry, index) => (
                                            <div key={`cell-${index}`} style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}/>
                                        ))}
                                    </Pie>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No spending data for this month.</div>
                         )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {historicalData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={historicalData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip contentStyle={{ background: "hsl(var(--background))" }} />
                                    <Legend />
                                    <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Income" />
                                    <Bar dataKey="expense" fill="hsl(var(--chart-5))" name="Expense" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                         ) : (
                             <div className="h-[300px] flex items-center justify-center text-muted-foreground">Not enough data to show trends.</div>
                         )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="transactions">
           <Card>
              <CardHeader>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <CardTitle>Recent Transactions</CardTitle>
                    <TransactionDialog 
                        open={isDialogOpen} 
                        onOpenChange={setIsDialogOpen}
                        transaction={selectedTransaction}
                        onSave={handleSaveTransaction}
                    >
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2"/>
                            Add Transaction
                        </Button>
                    </TransactionDialog>
                  </div>
              </CardHeader>
              <CardContent>
                  {isClient && transactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                           <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map(t => (
                          <TableRow key={t.id}>
                            <TableCell>{format(parseISO(t.date), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="font-medium">{t.description}</TableCell>
                            <TableCell><Badge variant="secondary">{t.category}</TableCell>
                            <TableCell className="text-muted-foreground">{getProjectTitle(t.projectId)}</TableCell>
                            <TableCell className={`text-right font-mono ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                              {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(t)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => removeTransaction(t.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : isClient ? (
                     <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                        <Landmark className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-semibold">No Transactions Yet</h3>
                        <p className="text-sm">Add your first transaction to see it here.</p>
                    </div>
                  ) : null}
              </CardContent>
              {isClient && transactions.length > 0 && (
                <CardFooter>
                    <p className="text-xs text-muted-foreground">Showing all {transactions.length} transactions.</p>
                </CardFooter>
              )}
           </Card>
        </TabsContent>
        <TabsContent value="budgets">
            <div className="space-y-6">
                <BudgetForm onSave={handleSaveBudget} />
                <Card>
                    <CardHeader>
                        <CardTitle>Your Budgets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {budgets.length > 0 ? (
                            budgets.map(budget => {
                                const spent = (monthlySpendingPerCategory.find(c => c.name === budget.category)?.value || 0);
                                const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                                const remaining = budget.amount - spent;
                                return (
                                    <Card key={budget.id}>
                                        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <h4 className="font-semibold text-lg">{budget.category}</h4>
                                                    <Badge variant="outline">{budget.period}</Badge>
                                                </div>
                                                <Progress value={progress} />
                                            </div>
                                            <div className="text-right font-mono shrink-0">
                                                <p>${spent.toFixed(2)} / ${budget.amount.toFixed(2)}</p>
                                                <p className={`text-sm ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    ${remaining.toFixed(2)} {remaining >= 0 ? 'left' : 'over'}
                                                </p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
                                                    <DropdownMenuItem onClick={() => removeBudget(budget.id)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                             <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                                <Target className="w-16 h-16 mb-4" />
                                <h3 className="text-xl font-semibold">No Budgets Set</h3>
                                <p className="text-sm">Create your first budget to start tracking.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
