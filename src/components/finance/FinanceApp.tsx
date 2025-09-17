'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, PieChart, Plus } from 'lucide-react';
import { Button } from '../ui/button';

export function FinanceApp() {

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
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">Updated just now</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">0 transactions this month</p>
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
                <Button>
                    <Plus className="mr-2"/>
                    Add Transaction
                </Button>
              </div>
          </CardHeader>
          <CardContent>
               <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                    <Landmark className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">No Transactions Yet</h3>
                    <p className="text-sm">Add your first transaction to see it here.</p>
                </div>
          </CardContent>
       </Card>
    </div>
  );
}
