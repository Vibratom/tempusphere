
'use client';

import { KanbanSquare, List, BarChartHorizontal, DraftingCompass, Table, ListChecks, Calendar, Spline, Brain, GitCommit } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const tools = [
    { value: 'board', icon: KanbanSquare, label: 'Board', href: '/projects/board', description: 'Organize tasks with a drag-and-drop Kanban board.' },
    { value: 'list', icon: List, label: 'List', href: '/projects/list', description: 'A detailed, filterable list of all your project tasks.' },
    { value: 'calendar', icon: Calendar, label: 'Calendar', href: '/projects/calendar', description: 'View tasks with due dates in a calendar format.' },
    { value: 'gantt', icon: BarChartHorizontal, label: 'Gantt', href: '/projects/gantt', description: 'Visualize project timelines with a Gantt chart.' },
    { value: 'spreadsheet', icon: Table, label: 'Spreadsheet', href: '/projects/spreadsheet', description: 'Manage data in a flexible, powerful spreadsheet.' },
    { value: 'checklist', icon: ListChecks, label: 'Checklist', href: '/projects/checklist', description: 'Track nested to-do items and progress.' },
    { value: 'canvas', icon: DraftingCompass, label: 'Canvas', href: '/projects/canvas', description: 'A freeform canvas for drawing and brainstorming.' },
    { value: 'chart', icon: GitCommit, label: 'Chart', href: '/projects/chart', description: 'Create diagrams using a visual or code editor.' },
    { value: 'mindmap', icon: Brain, label: 'Mind Map', href: '/projects/mindmap', description: 'Visually organize your thoughts with a mind map.' },
];

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Project Tools</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                A suite of integrated tools to help you plan, track, and manage your projects from start to finish.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tools.map((tool) => (
                <Link key={tool.value} href={tool.href} className="group">
                    <Card className="h-full flex flex-col bg-background/50 hover:bg-background transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                        <CardHeader className="p-4">
                           <div className="p-3 bg-primary/10 text-primary rounded-lg mb-3 inline-block group-hover:scale-110 transition-transform duration-300">
                             <tool.icon className="w-6 h-6" />
                           </div>
                           <CardTitle className="text-lg">{tool.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                           <CardDescription className="text-sm">{tool.description}</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}
