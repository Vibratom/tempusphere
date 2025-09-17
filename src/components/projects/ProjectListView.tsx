'use client';

import {
  ArrowUp,
  ArrowDown,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Progress } from '../ui/progress';

const residentialLandData = [
  { name: 'Cardinia Road Employment Precinct', developed: 1269, undeveloped: 0 },
  { name: 'Cardinia Road Precinct', developed: 7939, undeveloped: 3182 },
  { name: 'Officer Precinct', developed: 2080, undeveloped: 7919 },
  { name: 'Pakenham East Precinct', developed: 7162, undeveloped: 0 },
  { name: 'Pakenham Precinct', developed: 6074, undeveloped: 862 },
];

const undevelopedLotsByPrecinctData = [
    { name: 'Cardinia Road Employment Precinct', value: 1, fill: 'var(--color-cardinia-road-emp)' },
    { name: 'Cardinia Road Precinct', value: 11, fill: 'var(--color-cardinia-road)' },
    { name: 'Officer Precinct', value: 31, fill: 'var(--color-officer)' },
    { name: 'Pakenham East Precinct', value: 21, fill: 'var(--color-pakenham-east)' },
    { name: 'Other', value: 35, fill: 'var(--color-other-precinct)' },
];

const subdivisionHistoryData = [
    { year: '13/14', value: 1300 },
    { year: '14/15', value: 2100 },
    { year: '15/16', value: 1900 },
    { year: '16/17', value: 1900 },
    { year: '17/18', value: 1400 },
    { year: '18/19', value: 1200 },
];

const familiesHistoryData = [
    { year: '13/14', value: 1100 },
    { year: '14/15', value: 1500 },
    { year: '15/16', value: 1600 },
    { year: '17/18', value: 2100 },
    { year: '17/18', value: 1200 },
    { year: '18/19', value: 900 },
];

const babiesHistoryData = [
    { year: '13/14', value: 1400 },
    { year: '14/15', value: 1500 },
    { year: '15/16', value: 1600 },
    { year: '16/17', value: 1600 },
    { year: '17/18', value: 1600 },
    { year: '18/19', value: 900 },
];

const COLORS = ['#16a34a', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6'];


export function ProjectDashboard() {
  return (
    <div className="p-4 md:p-6 lg:p-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      
      {/* Top Row: KPIs and Charts */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Proposed Undeveloped Lots</CardTitle>
          <CardDescription>FUTURE DEVELOPMENT</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">20,960</p>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle>Residential Land Activity</CardTitle>
          <CardDescription>BY PRECINCT</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-48 w-full">
            <ResponsiveContainer>
              <BarChart data={residentialLandData} layout="vertical" stackOffset="expand">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                />
                <Legend iconType='circle' />
                <Bar dataKey="developed" name="Developed Lots" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 4, 4]} />
                <Bar dataKey="undeveloped" name="Undeveloped Lots" stackId="a" fill="hsl(var(--foreground))" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Proposed Undeveloped Lots by Precinct</CardTitle>
          <CardDescription>DISTRIBUTION OF PROPOSED UNDEVELOPED LOTS ACROSS THE SHIRE</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="h-48 w-full">
                <ResponsiveContainer>
                    <PieChart>
                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={undevelopedLotsByPrecinctData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60}>
                          {undevelopedLotsByPrecinctData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Second Row: KPIs */}
       <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Developed Lots</CardTitle>
          <CardDescription>LOTS WITH TITLES ISSUED</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
             <p className="text-3xl font-bold mb-2">16,248</p>
             <Progress value={(16248 / 17000) * 100} className="w-full" />
             <div className="w-full flex justify-between text-xs text-muted-foreground mt-1">
                <span>0K</span>
                <span>17K</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Subdivision Lots Lodged</CardTitle>
          <CardDescription>YTD COMPARISON WITH LAST YEAR</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <p className="text-4xl font-bold">66%</p>
          <ArrowUp className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Subdivision Lots Issued SOC</CardTitle>
          <CardDescription>YTD COMPARISON WITH LAST YEAR</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <p className="text-4xl font-bold">23%</p>
          <ArrowUp className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>
      
      <Card className="col-span-1 flex flex-col items-center justify-center">
         <CardContent className="pt-6">
            <div className="text-center">
                 <Users className="h-10 w-10 mx-auto text-primary" />
                <p className="text-5xl font-bold mt-2">6</p>
                <p className="text-muted-foreground">Families Moving to the Shire per Day</p>
            </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>New Families Moving to the Shire</CardTitle>
          <CardDescription>YTD COMPARISON WITH LAST YEAR</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <p className="text-4xl font-bold">6%</p>
          <ArrowUp className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>
      
      {/* Third row: Small charts and definitions */}

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Subdivision Lots Lodged</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-32 w-full">
            <BarChart data={subdivisionHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={2} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
       <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Subdivision Lots Issued SOC</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-32 w-full">
            <BarChart data={subdivisionHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false}/>
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={2} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Definitions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p><Badge variant="secondary" className="mr-2">Lodged</Badge>Lots in application for new subdivision stages.</p>
          <p><Badge variant="secondary" className="mr-2">SOC</Badge>Lots issued a 'Statement of Compliance' and can now be titled.</p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>New Families Moving to the Shire</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-32 w-full">
            <BarChart data={familiesHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={2} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

       <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Babies born in the Shire</CardTitle>
           <CardDescription>YTD COMPARISON WITH LAST YEAR</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <p className="text-4xl font-bold">-8%</p>
          <ArrowDown className="h-8 w-8 text-red-500" />
        </CardContent>
      </Card>
      
      <Card className="hidden lg:block">
      </Card>
      <Card className="hidden lg:block">
      </Card>
       <Card className="hidden lg:block">
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Babies born in the Shire</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-32 w-full">
            <BarChart data={babiesHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={2} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
