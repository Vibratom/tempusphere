
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, FileText, IterationCw, Megaphone, TrendingUp } from 'lucide-react';
import Link from "next/link";

const productivityTools = [
    { 
        icon: <FileText className="w-8 h-8 text-primary" />, 
        title: 'Meeting Minutes (MoM)', 
        description: 'Capture structured notes, action items, and key decisions from your meetings with various templates.',
        href: '/productivity/mom'
    },
    { 
        icon: <BrainCircuit className="w-8 h-8 text-primary" />, 
        title: 'Business Analysis', 
        description: 'Utilize frameworks like SWOT, PESTLE, and more to analyze your business environment.',
        href: '/productivity/analysis'
    },
    { 
        icon: <IterationCw className="w-8 h-8 text-primary" />, 
        title: 'Customer Lifecycle', 
        description: 'Manage and optimize every customer interaction across their entire journey.',
        href: '/productivity/clm'
    },
    { 
        icon: <Megaphone className="w-8 h-8 text-primary" />, 
        title: 'Marketing Strategy', 
        description: 'Plan your marketing efforts using frameworks like the 4Ps and content strategy boards.',
        href: '/productivity/marketing'
    },
    { 
        icon: <TrendingUp className="w-8 h-8 text-primary" />, 
        title: 'Win/Loss Analysis', 
        description: 'Analyze your sales outcomes to identify trends and improve your strategy.',
        href: '/productivity/win-loss'
    },
];

export default function ProductivityDashboardPage() {
  return (
    <div className="p-4 md:p-6 h-full">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Productivity Suite</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                A collection of tools designed for business analysts and professionals to streamline strategic planning and documentation.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productivityTools.map(tool => (
                <Link key={tool.title} href={tool.href} className="group">
                    <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            {tool.icon}
                            <CardTitle>{tool.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                {tool.description}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}
