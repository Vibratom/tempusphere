
'use client';

import { AlarmClock, CalendarDays, Clock, Combine, Expand, Globe, Hourglass, Scale, Settings, Timer, Users, Wand2 } from "lucide-react";
import Link from "next/link";
import { Footer } from "./Footer";
import { Button } from "../ui/button";

const features = [
    {
        icon: <Clock className="w-8 h-8 text-primary" />,
        title: 'Customizable Primary Clock',
        description: 'Choose between analog and digital modes. Display local or UTC time with optional seconds, all tailored to your preference.',
    },
    {
        icon: <Globe className="w-8 h-8 text-primary" />,
        title: 'World Clock Dashboard',
        description: 'Add and manage clocks for multiple cities and timezones. Your selections are saved locally for your convenience.',
    },
    {
        icon: <AlarmClock className="w-8 h-8 text-primary" />,
        title: 'Alarm System',
        description: 'Set multiple alarms with custom names and sounds. Never miss an important event again.',
    },
    {
        icon: <Hourglass className="w-8 h-8 text-primary" />,
        title: 'Precision Stopwatch',
        description: 'A high-precision stopwatch with start, stop, lap, and reset functions, perfect for timing any activity.',
    },
    {
        icon: <Timer className="w-8 h-8 text-primary" />,
        title: 'Countdown Timer',
        description: 'Set a countdown for any duration. An alarm will sound when the time is up, ideal for focus sessions or reminders.',
    },
    {
        icon: <Scale className="w-8 h-8 text-primary" />,
        title: 'Timezone Converter',
        description: 'Easily convert any time and date from one timezone to multiple others simultaneously.',
    },
    {
        icon: <Users className="w-8 h-8 text-primary" />,
        title: 'Conference Planner',
        description: 'Find the ideal meeting time across several timezones, highlighting optimal slots during business hours.',
    },
    {
        icon: <CalendarDays className="w-8 h-8 text-primary" />,
        title: 'Personal Calendar',
        description: 'Keep track of your personal events. Add, view, and manage your schedule right within the app.',
    },
    {
        icon: <Settings className="w-8 h-8 text-primary" />,
        title: 'Deep Customization',
        description: 'Personalize the look and feel with color pickers, background images, and light/dark themes.',
    },
    {
        icon: <Expand className="w-8 h-8 text-primary" />,
        title: 'Fullscreen Dashboard',
        description: 'Enter a distraction-free fullscreen mode. You choose which panels are visible for a focused experience.',
    }
];


export function LandingPage() {
    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            <main className="flex-1">
                <section className="py-20 md:py-32 text-center bg-background">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Welcome to Tempusphere</h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                            Your all-in-one solution for time management. From world clocks to conference planning, Tempusphere provides the tools you need to stay organized and productive across timezones.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/app">Launch App</Link>
                        </Button>
                    </div>
                </section>

                <section className="py-20 md:py-24 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features at a Glance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-card p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center gap-4 mb-4">
                                        {feature.icon}
                                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
