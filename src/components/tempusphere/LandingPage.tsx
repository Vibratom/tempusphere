
'use client';

import { AlarmClock, CalendarDays, Clock, Combine, Expand, Globe, Hourglass, Scale, Settings, Timer, Users, Wand2, Briefcase } from "lucide-react";
import Link from "next/link";
import { Footer } from "./Footer";
import { Button } from "../ui/button";
import { PrimaryClock } from "./PrimaryClock";
import { Header } from "./Header";

const features = [
    {
        icon: <Clock className="w-6 h-6 text-primary" />,
        title: 'Customizable Primary Clock',
        description: 'Choose between analog and digital modes, local or UTC time, with optional seconds.',
    },
    {
        icon: <Globe className="w-6 h-6 text-primary" />,
        title: 'World Clock Dashboard',
        description: 'Add and manage clocks for multiple timezones, saved locally for convenience.',
    },
    {
        icon: <AlarmClock className="w-6 h-6 text-primary" />,
        title: 'Alarm System',
        description: 'Set multiple alarms with custom names and a variety of sounds.',
    },
    {
        icon: <Hourglass className="w-6 h-6 text-primary" />,
        title: 'Precision Stopwatch',
        description: 'A high-precision stopwatch with start, stop, lap, and reset functions.',
    },
    {
        icon: <Timer className="w-6 h-6 text-primary" />,
        title: 'Countdown Timer',
        description: 'Set a countdown for any duration. An alarm sounds when time is up.',
    },
    {
        icon: <Scale className="w-6 h-6 text-primary" />,
        title: 'Timezone Converter',
        description: 'Easily convert any time and date across multiple timezones simultaneously.',
    },
    {
        icon: <Users className="w-6 h-6 text-primary" />,
        title: 'Conference Planner',
        description: 'Find ideal meeting times across several timezones, highlighting business hours.',
    },
    {
        icon: <CalendarDays className="w-6 h-6 text-primary" />,
        title: 'Personal Calendar',
        description: 'Keep track of your personal events with specific times and descriptions.',
    },
    {
        icon: <Settings className="w-6 h-6 text-primary" />,
        title: 'Deep Customization',
        description: 'Personalize the look with themes, background images, and custom colors.',
    },
    {
        icon: <Expand className="w-6 h-6 text-primary" />,
        title: 'Fullscreen Dashboard',
        description: 'A distraction-free, customizable view of your most important panels.',
    }
];


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
                            Your all-in-one solution for time management and event planning. From world clocks to a detailed personal calendar, Tempusphere provides the tools you need to stay organized and productive.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/app">Launch App</Link>
                        </Button>
                    </div>
                </section>

                <section className="py-16 md:py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Features at a Glance</h2>
                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {features.map((feature, index) => (
                                <div key={index} className="group relative flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1 p-2 bg-background rounded-full border shadow-sm">
                                      {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm mt-1">{feature.description}</p>
                                    </div>
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
