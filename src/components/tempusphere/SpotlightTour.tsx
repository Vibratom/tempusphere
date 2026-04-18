
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

interface TourStep {
    selector: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const pageTours: Record<string, TourStep[]> = {
    '/': [
        { selector: '[data-spotlight="primary-clock"]', title: 'Live Primary Clock', content: 'This is a fully functional clock that displays the current time. You can customize its appearance in the settings.', position: 'bottom' },
        { selector: '[data-spotlight="main-tools"]', title: 'Core Application Tools', content: 'These are the main sections of Tempusphere. Each one is a powerful application designed to help with different aspects of your work and life.', position: 'bottom' },
        { selector: '[data-spotlight="features-accordion"]', title: 'Features at a Glance', content: 'Explore this list to get a quick overview of all the powerful features packed into Tempusphere.', position: 'top' },
        { selector: '[data-spotlight="ecosystem-section"]', title: 'Vibratom Studios Ecosystem', content: 'Tempusphere is part of a larger suite of tools. Discover other apps designed to boost your productivity and creativity.', position: 'top' },
    ],
    '/app': [
        { selector: '[data-spotlight="primary-clock"]', title: 'The Primary Clock', content: 'This is your main clock display. You can customize its style, timezone, and size from the Appearance settings.', position: 'bottom' },
        { selector: '[data-spotlight="tool-tabs"]', title: 'Tool Panels', content: 'Switch between different tools like World Clocks, Alarms, and a Stopwatch here. Use keyboard shortcuts (Alt+1 to Alt+8) for quick navigation!', position: 'bottom' },
        { selector: '[data-spotlight="world-clocks-panel"]', title: 'World Clocks', content: 'Add and manage clocks for various timezones. This is perfect for coordinating with people across the globe.', position: 'top' },
        { selector: '[data-spotlight="settings-button"]', title: 'Settings', content: 'Click here to change the color theme, background image, and customize which panels appear in fullscreen mode.', position: 'left' },
        { selector: '[data-spotlight="fullscreen-button"]', title: 'Fullscreen Mode', content: 'Enter a distraction-free fullscreen view. You can choose which panels are visible in the settings. Press (F) to toggle.', position: 'left' },
    ],
};


export const SpotlightTour = ({ onExit }: { onExit: () => void }) => {
    const pathname = usePathname();
    const tourSteps = useMemo(() => pageTours[pathname] || [], [pathname]);

    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [api, setApi] = React.useState<CarouselApi>()
    
    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrentStep(api.selectedScrollSnap());
        };

        api.on("select", onSelect);

        return () => {
            api.off("select", onSelect);
        };
    }, [api]);
    
    useEffect(() => {
        if (tourSteps.length > 0) {
            const step = tourSteps[currentStep];
            const element = document.querySelector(step.selector) as HTMLElement;
            setHighlightedElement(element);
        } else {
            setHighlightedElement(null);
        }
    }, [currentStep, tourSteps]);

    useEffect(() => {
        if (highlightedElement) {
            highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            
            const rect = highlightedElement.getBoundingClientRect();
            const padding = 10;
            
            setStyle({
                width: `${rect.width + padding * 2}px`,
                height: `${rect.height + padding * 2}px`,
                top: `${rect.top - padding}px`,
                left: `${rect.left - padding}px`,
            });
        }
    }, [highlightedElement]);
    
    const handleNext = () => {
        if (api?.canScrollNext()) api.scrollNext();
        else onExit();
    };

    const handlePrev = () => {
        api?.scrollPrev();
    };

    if (tourSteps.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                <Card className="max-w-sm">
                    <CardHeader>
                        <CardTitle>Tutorial Not Available</CardTitle>
                        <CardDescription>Sorry, a spotlight tour isn't available for this page yet.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={onExit} className="w-full">Close</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (!highlightedElement) return null;

    return (
        <div className="fixed inset-0 z-50">
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect x={style.left as number} y={style.top as number} width={style.width} height={style.height} rx="12" fill="black" />
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.8" mask="url(#spotlight-mask)" />
            </svg>
            
            <div
                className="absolute border-2 border-primary border-dashed rounded-xl transition-all duration-500 pointer-events-none"
                style={style}
            />

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg z-10 p-4">
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {tourSteps.map((step, index) => (
                            <CarouselItem key={index}>
                                <Card>
                                    <CardHeader><CardTitle>{step.title}</CardTitle></CardHeader>
                                    <CardContent><p>{step.content}</p></CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="mt-4 flex justify-between items-center px-2">
                        <span className="text-sm text-white">{currentStep + 1} / {tourSteps.length}</span>
                        <div className="flex gap-2">
                           <CarouselPrevious variant="secondary" className="static translate-y-0" />
                           <Button size="sm" onClick={handleNext}>
                               {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="ml-2 h-4 w-4"/>
                           </Button>
                        </div>
                    </div>
                </Carousel>
            </div>
            
             <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white" onClick={onExit}>
                <X />
            </Button>
        </div>
    );
};
