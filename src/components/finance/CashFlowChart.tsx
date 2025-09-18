
'use client'

import React, { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Bar, BarChart, CartesianGrid, Label, ReferenceLine, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Legend, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar, Treemap } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { type ChartType } from './FinanceApp';

const INVESTING_CATEGORIES = ['Investment Gain'];
const FINANCING_EXPENSE_CATEGORIES = ['Interest Expense'];
const FINANCING_INCOME_CATEGORIES = ['Loan'];
const RADIAL_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function CashFlowChart({ chartType }: { chartType: ChartType }) {
    const { transactions } = useFinance();

    const chartData = useMemo(() => {
        const netIncome = transactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        const accountsPayableChange = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.status !== 'paid' ? t.amount : 0), 0);

        const accountsReceivableChange = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.status !== 'paid' ? -t.amount : 0), 0);
        
        const cashFromOperating = netIncome + accountsReceivableChange + accountsPayableChange;
            
        const investments = transactions
            .filter(t => t.status === 'paid' && INVESTING_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
            
        const cashFromInvesting = investments;

        const debtIssued = transactions
            .filter(t => t.status === 'paid' && FINANCING_INCOME_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const debtRepaid = transactions
            .filter(t => t.status === 'paid' && FINANCING_EXPENSE_CATEGORIES.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const cashFromFinancing = debtIssued - debtRepaid;

        return [
            { name: 'Operating', value: cashFromOperating, fill: 'hsl(var(--chart-2))'},
            { name: 'Investing', value: cashFromInvesting, fill: 'hsl(var(--chart-3))'},
            { name: 'Financing', value: cashFromFinancing, fill: 'hsl(var(--chart-4))'},
        ];

    }, [transactions]);
    
    if (!chartData) return <Skeleton className="h-80 w-full" />;

    const renderChart = () => {
        // Filter out negative values for chart types that don't handle them well
        const positiveData = chartData.map(item => ({ ...item, value: Math.max(0, item.value) }));
        const hasNegative = chartData.some(item => item.value < 0);

        switch (chartType) {
            case 'pie':
                return (
                    <PieChart>
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={positiveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                             {positiveData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend />
                        {hasNegative && <text x="50%" y="95%" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Negative values not shown in Pie Chart</text>}
                    </PieChart>
                );
             case 'radar':
                 return (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={30} domain={['auto', 'auto']} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Radar name="Cash Flow" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                    </RadarChart>
                );
            case 'radial':
                 return (
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={10} data={positiveData}>
                        <Tooltip content={<ChartTooltipContent />} />
                        <RadialBar dataKey="value">
                             {positiveData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={RADIAL_COLORS[index % RADIAL_COLORS.length]} />
                            ))}
                        </RadialBar>
                        <Legend iconSize={10} wrapperStyle={{ bottom: 0 }} />
                        {hasNegative && <text x="50%" y="95%" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Negative values not shown</text>}
                    </RadialBarChart>
                );
            case 'treemap':
                 return (
                    <>
                    <Treemap
                        data={positiveData}
                        dataKey="value"
                        ratio={4 / 3}
                        stroke="#fff"
                        fill="hsl(var(--chart-2))"
                        content={<CustomTreemapContent />}
                    >
                         <Tooltip content={<ChartTooltipContent />} />
                    </Treemap>
                    {hasNegative && <p className="text-xs text-center text-muted-foreground mt-2">Negative values not shown in Treemap</p>}
                    </>
                 );
            case 'bar':
            default:
                const barChartData = chartData.map((item, index) => {
                    let cumulative = 0;
                    for (let i = 0; i < index; i++) {
                        cumulative += chartData[i].value;
                    }
                    return {...item, range: [cumulative, cumulative + item.value] };
                });
                return (
                    <BarChart data={barChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent hideLabel />} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="range">
                            {barChartData.map((entry, index) => (
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
