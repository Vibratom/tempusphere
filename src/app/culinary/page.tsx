
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Archive, Trash2, Timer } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

// --- Data types from other components for context ---
interface Recipe { id: string; }
interface InventoryItem { id: string; quantity: number; lowStockThreshold: number; }
interface WasteEntry { id: string; cost: number; metric: 'Overproduction' | 'Spoilage' | 'Preparation Waste' | 'Other'; }
interface KitchenTimer { id: string; isRunning: boolean; }

const StatCard = ({ title, value, icon: Icon, href, description }: { title: string, value: string | number, icon: React.ElementType, href: string, description: string }) => (
    <Link href={href}>
        <Card className="hover:shadow-lg transition-shadow hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </Link>
);


export default function CulinaryDashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [recipes] = useLocalStorage<Recipe[]>('recipes:listV5', []);
  const [inventory] = useLocalStorage<InventoryItem[]>('culinary:inventory-v2', []);
  const [waste] = useLocalStorage<WasteEntry[]>('culinary:waste-tracker-v1', []);
  const [timers] = useLocalStorage<KitchenTimer[]>('culinary:timers-v2', []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { stats, wasteChartData, inventoryChartData } = useMemo(() => {
    const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length;
    const outOfStockItems = inventory.filter(item => item.quantity <= 0).length;
    const inStockItems = inventory.length - lowStockItems - outOfStockItems;
    const totalWasteCost = waste.reduce((sum, entry) => sum + entry.cost, 0);
    const activeTimers = timers.filter(timer => timer.isRunning).length;

    const wasteByMetric = waste.reduce((acc, entry) => {
        if (!acc[entry.metric]) {
            acc[entry.metric] = 0;
        }
        acc[entry.metric] += entry.cost;
        return acc;
    }, {} as Record<string, number>);

    const wasteChart = Object.entries(wasteByMetric).map(([name, cost]) => ({ name, cost }));

    const inventoryChart = [
        { name: 'In Stock', value: inStockItems, fill: 'hsl(var(--chart-2))' },
        { name: 'Running Low', value: lowStockItems, fill: 'hsl(var(--chart-4))' },
        { name: 'Out of Stock', value: outOfStockItems, fill: 'hsl(var(--chart-5))' },
    ].filter(item => item.value > 0);
    
    return {
        stats: {
            recipeCount: recipes.length,
            lowStockCount: lowStockItems + outOfStockItems,
            totalWaste: totalWasteCost,
            activeTimers: activeTimers,
        },
        wasteChartData: wasteChart,
        inventoryChartData: inventoryChart
    }
  }, [recipes, inventory, waste, timers]);
  
  if (!isClient) {
      return null;
  }

  return (
    <div className="p-4 md:p-8 h-full space-y-6">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Culinary Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                A quick overview of your kitchen operations.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                title="Recipe Book"
                value={stats.recipeCount}
                icon={BookOpen}
                href="/culinary/core-tools/book"
                description="Total recipes saved."
            />
            <StatCard 
                title="Inventory Status"
                value={stats.lowStockCount}
                icon={Archive}
                href="/culinary/core-tools/inventory"
                description="Items low or out of stock."
            />
            <StatCard 
                title="Total Waste"
                value={`$${stats.totalWaste.toFixed(2)}`}
                icon={Trash2}
                href="/culinary/waste-tracker"
                description="Total cost of wasted items."
            />
            <StatCard 
                title="Active Timers"
                value={stats.activeTimers}
                icon={Timer}
                href="/culinary/workflow/timers"
                description="Timers currently running."
            />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Waste Analysis</CardTitle>
                    <CardDescription>Total cost of waste by category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-64 w-full">
                        <ResponsiveContainer>
                            <BarChart data={wasteChartData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
                                <XAxis type="number" hide />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="cost" name="Cost" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Overview</CardTitle>
                    <CardDescription>Current stock levels at a glance.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <ChartContainer config={{}} className="h-64 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Tooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie data={inventoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {inventoryChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
