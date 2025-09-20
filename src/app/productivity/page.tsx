
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Briefcase, FileText } from 'lucide-react';

export default function ProductivityDashboardPage() {
  return (
    <div className="p-4 md:p-6">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Productivity Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                A suite of tools designed for business analysts and professionals to streamline workflows.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase /> Get Started</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Welcome to your new productivity hub. Use the tabs above to navigate between tools like the Meeting Minutes generator and more.
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Meeting Minutes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Click on the "MoM" tab to capture structured notes, action items, and key decisions from your meetings.
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb /> More Tools Coming</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                       This dashboard will expand with more tools for business analysis, such as SWOT analysis templates and RACI matrix builders.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
