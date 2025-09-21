
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, ListChecks, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// --- Data types from other components for context ---
interface Analysis {
    id: string;
    client: string;
    value: number;
    reason: string;
    learnings: string;
    outcome: 'win' | 'loss';
}

interface SwotItem {
  id: string;
  text: string;
}

interface ClmItem {
  id: string;
  text: string;
}
interface ClmStage {
  id: string;
  title: string;
  metrics: ClmItem[];
  actions: ClmItem[];
  notes: ClmItem[];
}

// --- Dashboard Component ---
export default function ProductivityDashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [analyses] = useLocalStorage<Analysis[]>('win-loss-analysis:v1', []);
  const [strengths] = useLocalStorage<SwotItem[]>('swot:strengths', []);
  const [weaknesses] = useLocalStorage<SwotItem[]>('swot:weaknesses', []);
  const [opportunities] = useLocalStorage<SwotItem[]>('swot:opportunities', []);
  const [threats] = useLocalStorage<SwotItem[]>('swot:threats', []);
  const [clmStages] = useLocalStorage<ClmStage[]>('clm:stages-v1', []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const winLossStats = useMemo(() => {
    const wins = analyses.filter(a => a.outcome === 'win');
    const losses = analyses.filter(a => a.outcome === 'loss');
    const totalWon = wins.reduce((sum, a) => sum + a.value, 0);
    const totalLost = losses.reduce((sum, a) => sum + a.value, 0);
    const winRate = analyses.length > 0 ? (wins.length / analyses.length) * 100 : 0;
    
    const reasonCounts = analyses.reduce((acc, curr) => {
        const reason = curr.reason.trim() || 'Unspecified';
        if (!acc[reason]) {
            acc[reason] = { wins: 0, losses: 0 };
        }
        if (curr.outcome === 'win') acc[reason].wins++;
        else acc[reason].losses++;
        return acc;
    }, {} as Record<string, { wins: number, losses: number }>);
    
    const reasonChartData = Object.entries(reasonCounts).map(([name, {wins, losses}]) => ({ name, wins, losses }));

    return { wins, losses, totalWon, totalLost, winRate, reasonChartData };
  }, [analyses]);

  const clmStats = useMemo(() => {
      if (!clmStages) return [];
      return clmStages.map(stage => ({
          name: stage.title,
          metrics: stage.metrics.length,
          actions: stage.actions.length,
          notes: stage.notes.length
      }))
  }, [clmStages]);

  const swotSummary = {
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      opportunities: opportunities.slice(0, 3),
      threats: threats.slice(0, 3),
      total: strengths.length + weaknesses.length + opportunities.length + threats.length
  }
  
  if (!isClient) {
      return (
          <div className="p-4 md:p-6 h-full flex items-center justify-center">
             <p>Loading Dashboard...</p>
          </div>
      )
  }

  return (
    <div className="p-4 md:p-6 h-full space-y-6">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Productivity Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                An overview of your strategic planning and sales analysis activities.
            </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value Won</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">${winLossStats.totalWon.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{winLossStats.wins.length} deals won</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value Lost</CardTitle>
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">${winLossStats.totalLost.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{winLossStats.losses.length} deals lost</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{winLossStats.winRate.toFixed(1)}%</div>
                     <p className="text-xs text-muted-foreground">by deal count</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SWOT Analysis Items</CardTitle>
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{swotSummary.total}</div>
                     <p className="text-xs text-muted-foreground">across all categories</p>
                </CardContent>
            </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Win/Loss Reasons</CardTitle>
                    <CardDescription>Common reasons for deal outcomes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-64 w-full">
                        <ResponsiveContainer>
                            <BarChart data={winLossStats.reasonChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="wins" name="Wins" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]}/>
                                <Bar dataKey="losses" name="Losses" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 0, 0, 4]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>CLM Strategy Focus</CardTitle>
                    <CardDescription>Number of items defined in each customer lifecycle stage.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={{}} className="h-64 w-full">
                        <ResponsiveContainer>
                           <BarChart data={clmStats} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis />
                             <Tooltip content={<ChartTooltipContent />} />
                             <Bar dataKey="metrics" name="Metrics" stackId="a" fill="hsl(var(--chart-1))" />
                             <Bar dataKey="actions" name="Actions" stackId="a" fill="hsl(var(--chart-2))" />
                             <Bar dataKey="notes" name="Notes" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        {/* Tables/Summaries */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Win/Loss Analyses</CardTitle>
                    <Button asChild variant="outline" size="sm"><Link href="/productivity/win-loss">View All</Link></Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                           <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Outcome</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analyses.slice(0, 5).map(a => (
                                <TableRow key={a.id}>
                                    <TableCell className="font-medium">{a.client}</TableCell>
                                    <TableCell><Badge variant={a.outcome === 'win' ? 'secondary' : 'destructive'}>{a.outcome}</Badge></TableCell>
                                    <TableCell className="text-right font-mono">${a.value.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                             {analyses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No analyses recorded.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>SWOT Summary</CardTitle>
                     <Button asChild variant="outline" size="sm"><Link href="/productivity/analysis">View Full Analysis</Link></Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">{swotSummary.strengths.map(s => <li key={s.id}>{s.text}</li>)}</ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-red-600">Weaknesses</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">{swotSummary.weaknesses.map(w => <li key={w.id}>{w.text}</li>)}</ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-blue-600">Opportunities</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">{swotSummary.opportunities.map(o => <li key={o.id}>{o.text}</li>)}</ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-yellow-600">Threats</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">{swotSummary.threats.map(t => <li key={t.id}>{t.text}</li>)}</ul>
                    </div>
                </CardContent>
            </Card>
         </div>
    </div>
  );
}

    