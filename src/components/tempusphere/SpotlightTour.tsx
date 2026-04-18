
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { ArrowLeft, ArrowRight, X, ArrowUp, ArrowDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
    // Add more tours for other pages here
};


export const SpotlightTour = ({ onExit }: { onExit: () => void }) => {
    const pathname = usePathname();
    const tourSteps = useMemo(() => pageTours[pathname] || [], [pathname]);

    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const [currentPosition, setCurrentPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
    
    useEffect(() => {
        if (tourSteps.length > 0) {
            const step = tourSteps[currentStep];
            const element = document.querySelector(step.selector) as HTMLElement;
            setHighlightedElement(element);
            setCurrentPosition(step.position || 'bottom');
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
            
            let preferredPosition = currentPosition;
            const popoverWidth = 288; // w-72 from Card
            const popoverHeight = 250; // Estimated height
            const margin = 16;
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;

            const fits = {
                bottom: rect.bottom + padding + margin + popoverHeight < viewportH,
                top: rect.top - padding - margin - popoverHeight > 0,
                right: rect.right + padding + margin + popoverWidth < viewportW,
                left: rect.left - padding - margin - popoverWidth > 0,
            };

            // If the user's preferred position doesn't fit, find a fallback.
            if (!fits[preferredPosition]) {
                const fallbackOrder: ('bottom' | 'top' | 'right' | 'left')[] = ['bottom', 'top', 'right', 'left'];
                const bestFit = fallbackOrder.find(pos => fits[pos]);
                if (bestFit) {
                    preferredPosition = bestFit;
                }
            }

            let popoverTop = 0, popoverLeft = 0;
            
            switch (preferredPosition) {
                case 'top':
                    popoverTop = rect.top - padding - margin;
                    popoverLeft = rect.left + rect.width / 2;
                    break;
                case 'right':
                    popoverTop = rect.top + rect.height / 2;
                    popoverLeft = rect.right + padding + margin;
                    break;
                case 'left':
                    popoverTop = rect.top + rect.height / 2;
                    popoverLeft = rect.left - padding - margin;
                    break;
                case 'bottom':
                default:
                    popoverTop = rect.bottom + padding + margin;
                    popoverLeft = rect.left + rect.width / 2;
                    break;
            }

             setPopoverStyle({
                top: `${popoverTop}px`,
                left: `${popoverLeft}px`,
                transform: preferredPosition === 'top' ? 'translate(-50%, -100%)' :
                           preferredPosition === 'right' ? 'translate(0, -50%)' :
                           preferredPosition === 'left' ? 'translate(-100%, -50%)' :
                           'translate(-50%, 0)',
            });

        }
    }, [highlightedElement, currentPosition]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onExit();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
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
            {/* Overlay */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect x={style.left as number} y={style.top as number} width={style.width} height={style.height} rx="12" fill="black" />
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.8" mask="url(#spotlight-mask)" />
            </svg>
            
            {/* Highlight Box */}
            <div
                className="absolute border-2 border-primary border-dashed rounded-xl transition-all duration-500 pointer-events-none"
                style={style}
            />

            {/* Popover */}
            <div className="absolute transition-all duration-500" style={popoverStyle}>
                <Card className="w-72 shadow-2xl animation-fade-in">
                    <CardHeader>
                         <CardTitle>{tourSteps[currentStep].title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{tourSteps[currentStep].content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{currentStep + 1} / {tourSteps.length}</span>
                        <div className="flex gap-2">
                           <Button size="sm" variant="ghost" onClick={handlePrev} disabled={currentStep === 0}>
                               <ArrowLeft />
                           </Button>
                           <Button size="sm" onClick={handleNext}>
                               {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="ml-2"/>
                           </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            
             <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white" onClick={onExit}>
                <X />
            </Button>
        </div>
    );
};
