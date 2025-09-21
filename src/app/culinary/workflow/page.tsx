
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Workflow, Timer, ListChecks, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo } from "react";
import { usePathname } from "next/navigation";

const workflowTools = [
    { value: 'timers', label: 'Kitchen Timer Station', href: '/culinary/workflow/timers', icon: Timer, description: "A single-page app with multiple independent timers. A chef can start a timer for their pasta, another for their sauce, and a third for the bread, all on one screen." },
    { value: 'checklist', label: 'Recipe Preparation Checklist', href: '/culinary/workflow/checklist', icon: ListChecks, description: "An interactive checklist for a specific recipe. As you complete a step (e.g., \"chop onions\"), you can check it off, helping you stay on track and ensure you don't miss anything." },
    { value: 'kds', label: 'Kitchen Display System (KDS) Light', href: '/culinary/workflow/kds', icon: KanbanSquare, description: "A simplified version of a KDS. It would show incoming orders from a text field and use color coding (e.g., green for new, yellow for in progress, red for delayed) to help prioritize." },
];

export default function CulinaryWorkflowPage() {
    const pathname = usePathname();
    const activeSubTool = useMemo(() => pathname.split('/')[3] || 'timers', [pathname]);

    return (
        <div className="p-4 md:p-8">
            <Tabs defaultValue={activeSubTool} value={activeSubTool} className="w-full flex-1 flex flex-col">
                <div className="text-center my-6">
                    <TabsList className="h-auto">
                        {workflowTools.map(tool => (
                            <TabsTrigger key={tool.value} value={tool.value} asChild>
                                <Link href={tool.href}>{tool.label}</Link>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                 <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Card className="max-w-md">
                        <CardHeader>
                            <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                              <Workflow className="h-10 w-10 text-muted-foreground"/>
                            </div>
                            <CardTitle className="mt-4">Coming Soon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                This tool is currently under development. Please check back later!
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
}
