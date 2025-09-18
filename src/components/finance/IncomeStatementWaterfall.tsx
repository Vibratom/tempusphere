
'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, ReferenceLine, Pie, PieChart, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, Treemap } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { type ChartType } from './FinanceApp';

const RADIAL_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function IncomeStatementChart({ chartType }: { chartType: ChartType }) {
    const { transactions } = useFinance();

    const chartData = useMemo(() => {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netIncome = totalIncome - totalExpenses;

        return [
            { name: 'Revenue', value: totalIncome, fill: 'hsl(var(--chart-2))' },
            { name: 'Expenses', value: totalExpenses, fill: 'hsl(var(--chart-5))' }, // Use positive value for pie charts
            { name: 'Net Income', value: netIncome, fill: netIncome >= 0 ? 'hsl(var(--foreground))' : 'hsl(var(--destructive))' },
        ];
    }, [transactions]);
    
    if (!chartData) return <Skeleton className="h-80 w-full" />;

    const renderChart = () => {
        switch (chartType) {
            case 'pie':
                return (
                    <PieChart>
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData.filter(d => d.name !== 'Net Income')} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={10} data={chartData.filter(d => d.value >= 0)}>
                        <Tooltip content={<ChartTooltipContent />} />
                        <RadialBarChart dataKey="value">
                             {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={RADIAL_COLORS[index % RADIAL_COLORS.length]} />
                            ))}
                        </RadialBarChart>
                        <Legend iconSize={10} wrapperStyle={{ bottom: 0 }} />
                    </RadialBarChart>
                );
             case 'treemap':
                 return (
                    <Treemap
                        data={chartData.filter(d => d.value >= 0)}
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
                const waterfallData = [
                    { name: 'Revenue', value: chartData[0].value, fill: chartData[0].fill },
                    { name: 'Expenses', value: -chartData[1].value, fill: chartData[1].fill },
                    { name: 'Net Income', value: chartData[2].value, fill: chartData[2].fill },
                ];
                return (
                     <BarChart data={waterfallData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                           <LabelList 
                                dataKey="value"
                                position="top" 
                                offset={8}
                                className="fill-foreground text-sm font-medium"
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                            />
                           {waterfallData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                        </Bar>
                    </BarChart>
                )
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
  if (!root.children || index < 0) return null;
  const item = root.children[index];
   if(!item) return null;
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

