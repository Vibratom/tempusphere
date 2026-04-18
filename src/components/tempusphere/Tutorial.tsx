
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { ArrowLeft, ArrowRight, X, BookOpen, Map, HelpCircle, Book } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { SpotlightTour } from './SpotlightTour';
import { InteractiveTour } from './InteractiveTour';

export function Tutorial() {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [activeTour, setActiveTour] = useState<'none' | 'spotlight' | 'interactive'>('none');

    const startTour = (tourType: 'spotlight' | 'interactive') => {
        setSheetOpen(false);
        setActiveTour(tourType);
    };
    
    const exitTour = () => {
        setActiveTour('none');
    };

    const tourOptions = [
        {
            category: 'STATIC',
            items: [
                {
                    title: 'Static Guide',
                    description: 'Read a simple text-based guide.',
                    icon: Book,
                    action: () => {
                        // This option is present but currently has no action.
                        // A future implementation could open a modal with static text.
                    },
                    disabled: true,
                    comingSoon: true,
                }
            ]
        },
        {
            category: 'ANIMATED',
            items: [
                {
                    title: 'Spotlight Tour',
                    description: 'A guided tour that highlights features one by one.',
                    icon: Map,
                    action: () => startTour('spotlight'),
                    disabled: false,
                    comingSoon: false,
                },
                {
                    title: 'Interactive Walkthrough',
                    description: 'An interactive guide where you perform actions.',
                    icon: HelpCircle,
                    action: () => startTour('interactive'),
                    disabled: false,
                    comingSoon: false,
                }
            ]
        }
    ];

    return (
        <>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                     <Button variant="outline" size="icon">
                        <BookOpen className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="p-6">
                        <SheetTitle>How would you like to learn?</SheetTitle>
                        <SheetDescription>
                            Choose a method below to get a tour of the current page's features.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                        {tourOptions.map(section => (
                            <div key={section.category}>
                                <h3 className="mb-3 text-sm font-semibold text-muted-foreground tracking-wider uppercase">{section.category}</h3>
                                <div className="space-y-3">
                                    {section.items.map(item => (
                                        <button
                                            key={item.title}
                                            onClick={item.action}
                                            disabled={item.disabled}
                                            className="w-full text-left rounded-lg border bg-card hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <div className="flex items-center gap-4 p-4">
                                                <div className={cn(
                                                    "p-3 rounded-lg",
                                                    item.disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                                                )}>
                                                    <item.icon className="h-6 w-6 flex-shrink-0"/>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-base">
                                                        {item.title} 
                                                        {item.comingSoon && <span className="text-xs text-muted-foreground font-normal ml-2">(Coming Soon)</span>}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>

            {activeTour === 'spotlight' && <SpotlightTour onExit={exitTour} />}
            {activeTour === 'interactive' && <InteractiveTour onExit={exitTour} />}
        </>
    );
}
