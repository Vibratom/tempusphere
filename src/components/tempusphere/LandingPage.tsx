
'use client';

import { AlarmClock, CalendarDays, Clock, Combine, Expand, Globe, Hourglass, Scale, Settings, Timer, Users, Landmark, BrainCircuit, DraftingCompass, KanbanSquare, FileText, Table, UtensilsCrossed, ListChecks } from "lucide-react";
import Link from "next/link";
import { Footer } from "./Footer";
import { Button } from "../ui/button";
import { PrimaryClock } from "./PrimaryClock";
import { Header } from "./Header";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PlatformLink } from "./PlatformLink";

const features = [
    {
        icon: <Clock className="w-5 h-5 text-primary" />,
        title: 'Customizable Primary Clock',
        description: 'Choose between analog and digital modes, local or UTC time, with optional seconds.',
    },
    {
        icon: <Globe className="w-5 h-5 text-primary" />,
        title: 'World Clock Dashboard',
        description: 'Add and manage clocks for multiple timezones, saved locally for convenience.',
    },
    {
        icon: <AlarmClock className="w-5 h-5 text-primary" />,
        title: 'Alarm System',
        description: 'Set multiple alarms with custom names and a variety of sounds.',
    },
    {
        icon: <Hourglass className="w-5 h-5 text-primary" />,
        title: 'Precision Stopwatch',
        description: 'A high-precision stopwatch with start, stop, lap, and reset functions.',
    },
    {
        icon: <Timer className="w-5 h-5 text-primary" />,
        title: 'Countdown Timer',
        description: 'Set a countdown for any duration. An alarm sounds when time is up.',
    },
    {
        icon: <Scale className="w-5 h-5 text-primary" />,
        title: 'Timezone Converter',
        description: 'Easily convert any time and date across multiple timezones simultaneously.',
    },
    {
        icon: <Users className="w-5 h-5 text-primary" />,
        title: 'Conference Planner',
        description: 'Find ideal meeting times across several timezones, highlighting business hours.',
    },
    {
        icon: <CalendarDays className="w-5 h-5 text-primary" />,
        title: 'Comprehensive Event Management',
        description: 'A robust personal calendar to keep track of your events with specific times and descriptions.',
    },
    {
        icon: <ListChecks className="w-5 h-5 text-primary" />,
        title: 'Advanced Checklist',
        description: 'Organize tasks with sub-tasks, priorities, recurring items, and calendar integration.',
    },
     {
        icon: <KanbanSquare className="w-5 h-5 text-primary" />,
        title: 'Project Management Boards',
        description: 'Visualize your workflow with Kanban-style boards, with sharing and live collaboration.',
    },
    {
        icon: <DraftingCompass className="w-5 h-5 text-primary" />,
        title: 'Mind Mapping',
        description: 'Visually organize your thoughts and ideas with an infinite canvas.',
    },
    {
        icon: <UtensilsCrossed className="w-5 h-5 text-primary" />,
        title: 'Recipe Remix',
        description: 'A personal cookbook where you can save, edit, and "remix" recipes to track variations.',
    },
    {
        icon: <Settings className="w-5 h-5 text-primary" />,
        title: 'Deep Customization',
        description: 'Personalize the look with themes, background images, and custom colors.',
    },
    {
        icon: <Expand className="w-5 h-5 text-primary" />,
        title: 'Fullscreen Dashboard',
        description: 'A distraction-free, customizable view of your most important panels.',
    }
];

const otherPlatforms = [
    { name: 'Finance', category: 'Finance', icon: Landmark, href: '#', color: 'bg-indigo-500 hover:bg-indigo-600', description: 'Track expenses and manage budgets with ease.' },
    { name: 'Education', category: 'Education', icon: BrainCircuit, href: '#', color: 'bg-amber-500 hover:bg-amber-600', description: 'Create and share interactive learning modules.' },
    { name: 'Recipes', category: 'Recipes', icon: UtensilsCrossed, href: '/recipes', color: 'bg-yellow-500 hover:bg-yellow-600', description: 'Organize recipes and plan your meals.' },
    { name: 'Projects', category: 'Projects', icon: KanbanSquare, href: '/projects', color: 'bg-rose-500 hover:bg-rose-600', description: 'Manage projects with Kanban-style boards.' },
    { name: 'Mind Map', category: 'Mind Map', icon: DraftingCompass, href: '/mindmap', color: 'bg-sky-500 hover:bg-sky-600', description: 'Visually organize your thoughts.' },
]


export function LandingPage() {
    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="py-16 md:py-24 text-center bg-background">
                    <div className="container mx-auto px-4 flex flex-col items-center">
                        <div className="mb-6">
                            <PrimaryClock />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Welcome to Tempusphere</h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                            Your all-in-one solution for time management. From world clocks to a detailed personal calendar, Tempusphere provides the tools you need to stay organized and productive.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/app">Launch App</Link>
                        </Button>
                    </div>
                </section>
                
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 text-center">
                         <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Other Tools</h2>
                        <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
                            Tempusphere is part of a growing ecosystem of powerful utilities to help with daily tasks.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                            {otherPlatforms.map(p => <PlatformLink key={p.name} {...p} />)}
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-16 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Features at a Glance</h2>
                        <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
                            {features.map((feature, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-md font-semibold hover:no-underline py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 p-1.5 bg-background rounded-full border shadow-sm">
                                                {feature.icon}
                                            </div>
                                            <span>{feature.title}</span>
                                        </div>

                                    </AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground pl-12">
                                        {feature.description}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
