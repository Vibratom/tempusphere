'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Archive, Trash2, Timer, AlertCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

// --- Data types from other components for context ---
interface Recipe { id: string; }
interface InventoryItem { id: string; quantity: number; lowStockThreshold: number; }
interface WasteEntry { id: string; cost: number; }
interface KitchenTimer { id: string; isRunning: boolean; }

const StatCard = ({ title, value, icon: Icon, href, description, color }: { title: string, value: string | number, icon: React.ElementType, href: string, description: string, color?: string }) => (
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

  const stats = useMemo(() => {
    const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length;
    const outOfStockItems = inventory.filter(item => item.quantity <= 0).length;
    const totalWasteCost = waste.reduce((sum, entry) => sum + entry.cost, 0);
    const activeTimers = timers.filter(timer => timer.isRunning).length;

    return {
        recipeCount: recipes.length,
        lowStockCount: lowStockItems + outOfStockItems,
        totalWaste: totalWasteCost,
        activeTimers: activeTimers,
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
        
        {/* We can add more detailed cards or charts here in the future */}
    </div>
  );
}
