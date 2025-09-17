'use client';

import React, { useMemo } from 'react';
import { useProjects, Priority } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ListTodo, Loader, Wallet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useFinance } from '@/contexts/FinanceContext';
import { Badge } from '../ui/badge';
import { format, parseISO } from 'date-fns';

const priorityColors: Record<Priority, string> = {
    none: '#94a3b8',    // slate-400
    low: '#3b82f6',     // blue-500
    medium: '#f97316',  // orange-500
    high: '#ef4444',    // red-500
};

const getPriorityLabel = (priority: Priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
};


export function ProjectDashboard() {
  const { board } = useProjects();
  const { transactions } = useFinance();

  const dashboardStats = useMemo(() => {
    const tasks = Object.values(board.tasks);
    const totalTasks = tasks.length;
    
    const doneColumnIds = board.columnOrder.slice(-1); // Assume last column is "Done"
    const doneTaskIds = new Set(doneColumnIds.flatMap(id => board.columns[id]?.taskIds || []));
    
    const completedTasks = tasks.filter(t => doneTaskIds.has(t.id)).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);
    
    const tasksByStatus = board.columnOrder.map(columnId => {
      const column = board.columns[columnId];
      return {
        name: column.title,
        value: column.taskIds.length,
      };
    });

    const projectTaskIds = new Set(Object.keys(board.tasks));
    const projectTransactions = transactions.filter(t => t.projectId && projectTaskIds.has(t.projectId));
    const totalBudget = projectTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

    const upcomingDeadlines = tasks.filter(t => t.dueDate && new Date(t.dueDate) >= new Date()).sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()).slice(0, 5);

    return {
      totalTasks,
      completedTasks,
      progress,
      tasksByPriority,
      tasksByStatus,
      totalBudget,
      upcomingDeadlines
    };
  }, [board, transactions]);

  const priorityChartData = Object.entries(dashboardStats.tasksByPriority).map(([priority, count]) => ({
    name: getPriorityLabel(priority as Priority),
    value: count,
    fill: priorityColors[priority as Priority],
  }));

  const statusChartData = dashboardStats.tasksByStatus;
  const statusChartColors = ['#3b82f6', '#f97316', '#16a34a', '#9333ea', '#f43f5e'];

  return (
    <div className="p-4 md:p-6 grid gap-6 grid-cols-1 lg:grid-cols-4">

      {/* KPIs */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListTodo /> Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dashboardStats.totalTasks}</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle2 /> Completed Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dashboardStats.completedTasks}</p>
        </CardContent>
      </Card>
      
       <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Loader /> Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-4xl font-bold">{dashboardStats.progress.toFixed(0)}%</p>
        </CardContent>
      </Card>
      
       <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet /> Project Budget</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-4xl font-bold">${dashboardStats.totalBudget.toLocaleString()}</p>
        </CardContent>
      </Card>


      {/* Charts */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tasks by Status</CardTitle>
          <CardDescription>Distribution of tasks across your Kanban board columns.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={statusChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="Tasks">
                    {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusChartColors[index % statusChartColors.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tasks by Priority</CardTitle>
           <CardDescription>How tasks are prioritized across the project.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="h-64 w-full">
                <ResponsiveContainer>
                    <PieChart>
                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={priorityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} />
                        <Legend iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-4">
        <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Tasks with the soonest due dates.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                {dashboardStats.upcomingDeadlines.length > 0 ? dashboardStats.upcomingDeadlines.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{backgroundColor: priorityColors[task.priority]}}></div>
                           <p className="font-medium">{task.title}</p>
                        </div>
                        <Badge variant="outline">{format(parseISO(task.dueDate!), 'MMM d, yyyy')}</Badge>
                    </div>
                )) : <p className="text-muted-foreground text-center py-4">No upcoming deadlines found.</p>}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
