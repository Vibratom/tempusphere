
'use client'

import React, { useMemo, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';

const INVESTING_CATEGORIES = ['Investment Gain'];
const FINANCING_EXPENSE_CATEGORIES = ['Interest Expense'];
const FINANCING_INCOME_CATEGORIES = ['Loan'];

// Helper function to generate a consistent color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

const allMetrics = {
    income: [
        { key: 'sales', label: 'Sales' },
        { key: 'cogs', label: 'Cost of Goods Sold' },
        { key: 'grossProfit', label: 'Gross Profit' },
        { key: 'totalOperatingExpenses', label: 'Operating Expenses' },
        { key: 'operatingIncome', label: 'Operating Income' },
        { key: 'netIncome', label: 'Net Income' },
    ],
    balance: [
        { key: 'cash', label: 'Cash' },
        { key: 'receivables', label: 'Accounts Receivable' },
        { key: 'payables', label: 'Accounts Payable' },
        { key: 'totalAssets', label: 'Total Assets' },
        { key: 'totalLiabilities', label: 'Total Liabilities' },
        { key: 'totalEquity', label: 'Total Equity' },
        { key: 'totalLiabilitiesAndEquity', label: 'Total Liabilities & Equity'},
    ],
    cashFlow: [
        { key: 'operatingActivities', label: 'Cash from Operations' },
        { key: 'investingActivities', label: 'Cash from Investing' },
        { key: 'financingActivities', label: 'Cash from Financing' },
        { key: 'netCashFlow', label: 'Net Cash Flow' },
    ],
};

export function DynamicReportChart() {
    const { transactions } = useFinance();
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['sales', 'netIncome', 'totalAssets']);

    const financialData = useMemo(() => {
        // --- Income Statement Calcs ---
        const sales = transactions.filter(t => t.type === 'income' && !['Interest Income', 'Investment Gain'].includes(t.category)).reduce((sum, t) => sum + t.amount, 0);
        const cogs = transactions.filter(t => t.type === 'expense' && t.category === 'Cost of Goods Sold').reduce((sum, t) => sum + t.amount, 0);
        const grossProfit = sales - cogs;
        const totalSellingExpenses = transactions.filter(t => t.type === 'expense' && ['Advertising', 'Commission'].includes(t.category)).reduce((sum, t) => sum + t.amount, 0);
        const totalAdminExpenses = transactions.filter(t => t.type === 'expense' && ['Office Supplies', 'Office Equipment', 'Utilities', 'Rent/Mortgage'].includes(t.category)).reduce((sum, t) => sum + t.amount, 0);
        const totalOperatingExpenses = totalSellingExpenses + totalAdminExpenses;
        const operatingIncome = grossProfit - totalOperatingExpenses;
        const interestRevenue = transactions.filter(t => t.type === 'income' && t.category === 'Interest Income').reduce((sum, t) => sum + t.amount, 0);
        const investmentGain = transactions.filter(t => t.type === 'income' && t.category === 'Investment Gain').reduce((sum, t) => sum + t.amount, 0);
        const interestExpense = transactions.filter(t => t.type === 'expense' && t.category === 'Interest Expense').reduce((sum, t) => sum + t.amount, 0);
        const totalNonOperating = interestRevenue + investmentGain - interestExpense;
        const netIncome = operatingIncome + totalNonOperating;

        // --- Balance Sheet Calcs ---
        const cash = transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        const receivables = transactions.filter(t => t.type === 'income' && t.status !== 'paid').reduce((sum, t) => sum + t.amount, 0);
        const payables = transactions.filter(t => t.type === 'expense' && t.status !== 'paid').reduce((sum, t) => sum + t.amount, 0);
        const retainedEarnings = netIncome; // Simplified
        const totalCurrentAssets = cash + receivables;
        const totalAssets = totalCurrentAssets;
        const totalLiabilities = payables;
        const totalEquity = retainedEarnings;
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
        
        // --- Cash Flow Calcs ---
        const accountsPayableChange = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.status !== 'paid' ? t.amount : 0), 0);
        const accountsReceivableChange = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.status !== 'paid' ? -t.amount : 0), 0);
        const operatingActivities = netIncome + accountsReceivableChange + accountsPayableChange;
        const investingActivities = transactions.filter(t => t.status === 'paid' && INVESTING_CATEGORIES.includes(t.category)).reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        const debtIssued = transactions.filter(t => t.status === 'paid' && FINANCING_INCOME_CATEGORIES.includes(t.category)).reduce((sum, t) => sum + t.amount, 0);
        const debtRepaid = transactions.filter(t => t.status === 'paid' && FINANCING_EXPENSE_CATEGORIES.includes(t.category)).reduce((sum, t) => sum + t.amount, 0);
        const financingActivities = debtIssued - debtRepaid;
        const netCashFlow = operatingActivities + investingActivities + financingActivities;

        return { 
            sales, cogs, grossProfit, totalOperatingExpenses, operatingIncome, netIncome,
            cash, receivables, payables, totalAssets, totalLiabilities, totalEquity, totalLiabilitiesAndEquity,
            operatingActivities, investingActivities, financingActivities, netCashFlow
        };
    }, [transactions]);
    
    const chartData = useMemo(() => {
        return selectedMetrics.map(key => {
            const allMetricsList = [...allMetrics.income, ...allMetrics.balance, ...allMetrics.cashFlow];
            const metricInfo = allMetricsList.find(m => m.key === key);
            return {
                name: metricInfo?.label || key,
                value: (financialData as any)[key] || 0,
            };
        }).filter(item => item.value !== undefined);
    }, [selectedMetrics, financialData]);
    
    const handleMetricToggle = (key: string, checked: boolean) => {
        setSelectedMetrics(prev => 
            checked ? [...prev, key] : prev.filter(m => m !== key)
        );
    };

    if (!financialData) return <Skeleton className="h-80 w-full" />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 h-96">
                <ChartContainer config={{}} className="h-full w-full">
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tick={false} />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                            <ReferenceLine y={0} stroke="hsl(var(--border))" />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                               <LabelList 
                                    dataKey="name"
                                    position="top" 
                                    offset={8}
                                    className="fill-foreground text-sm font-medium"
                                />
                               {chartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={stringToColor(entry.name)} />
                               ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
             <div className="md:col-span-1">
                <Card>
                    <CardContent className="p-4">
                        <ScrollArea className="h-96">
                           <div className="space-y-4 pr-4">
                                <div>
                                    <h4 className="font-bold mb-2">Income Statement</h4>
                                    {allMetrics.income.map(metric => (
                                        <div key={metric.key} className="flex items-center space-x-2 my-1">
                                            <Checkbox id={metric.key} checked={selectedMetrics.includes(metric.key)} onCheckedChange={(c) => handleMetricToggle(metric.key, !!c)}/>
                                            <Label htmlFor={metric.key} className="text-sm font-normal cursor-pointer">{metric.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h4 className="font-bold mb-2">Balance Sheet</h4>
                                    {allMetrics.balance.map(metric => (
                                        <div key={metric.key} className="flex items-center space-x-2 my-1">
                                            <Checkbox id={metric.key} checked={selectedMetrics.includes(metric.key)} onCheckedChange={(c) => handleMetricToggle(metric.key, !!c)}/>
                                            <Label htmlFor={metric.key} className="text-sm font-normal cursor-pointer">{metric.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h4 className="font-bold mb-2">Cash Flow</h4>
                                    {allMetrics.cashFlow.map(metric => (
                                        <div key={metric.key} className="flex items-center space-x-2 my-1">
                                            <Checkbox id={metric.key} checked={selectedMetrics.includes(metric.key)} onCheckedChange={(c) => handleMetricToggle(metric.key, !!c)}/>
                                            <Label htmlFor={metric.key} className="text-sm font-normal cursor-pointer">{metric.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
