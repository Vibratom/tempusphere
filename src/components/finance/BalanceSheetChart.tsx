
'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Legend, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, Treemap } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { type ChartType } from './FinanceApp';

const RADIAL_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function BalanceSheetChart({ chartType }: { chartType: ChartType }) {
    const { transactions } = useFinance();

    const chartData = useMemo(() => {
        const cash = transactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        const receivables = transactions
            .filter(t => t.type === 'income' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalAssets = cash + receivables;

        const payables = transactions
            .filter(t => t.type === 'expense' && t.status !== 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
        const retainedEarnings = transactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        return [
            { name: 'Assets', value: totalAssets, fill: 'hsl(var(--chart-2))' },
            { name: 'Liabilities', value: payables, fill: 'hsl(var(--chart-4))' },
            { name: 'Equity', value: retainedEarnings > 0 ? retainedEarnings : 0, fill: 'hsl(var(--chart-5))' },
        ];
    }, [transactions]);
    
    if (!chartData) return <Skeleton className="h-80 w-full" />;

    const renderChart = () => {
        switch (chartType) {
            case 'pie':
                return (
                    <PieChart>
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                );
            case 'radar':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Radar name="Amount" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                    </RadarChart>
                );
            case 'radial':
                 return (
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={10} data={chartData}>
                        <Tooltip content={<ChartTooltipContent />} />
                        <RadialBar dataKey="value">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={RADIAL_COLORS[index % RADIAL_COLORS.length]} />
                            ))}
                        </RadialBar>
                        <Legend iconSize={10} wrapperStyle={{ bottom: 0 }} />
                    </RadialBarChart>
                );
            case 'treemap':
                 return (
                    <Treemap
                        data={chartData}
                        dataKey="value"
                        ratio={4 / 3}
                        stroke="#fff"
                        fill="hsl(var(--chart-2))"
                        content={<CustomTreemapContent />}
                    >
                        <Tooltip content={<ChartTooltipContent />} />
                    </Treemap>
                 );
            case 'bar':
            default:
                return (
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            <LabelList 
                                dataKey="value"
                                position="right" 
                                offset={8}
                                className="fill-foreground text-sm font-medium"
                                formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                            />
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                );
        }
    }


    return (
        <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
                {renderChart()}
            </ResponsiveContainer>
        </ChartContainer>
    );
}

const CustomTreemapContent = ({ root, depth, x, y, width, height, index, payload, rank, name }: any) => {
  const item = root.children[index];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: item.fill,
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
        {item.name}
      </text>
    </g>
  );
};
