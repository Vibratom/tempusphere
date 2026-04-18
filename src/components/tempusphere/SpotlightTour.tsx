"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { ArrowLeft, ArrowRight, X, Loader2 } from 'lucide-react';
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
};


export const SpotlightTour = ({ onExit }: { onExit: () => void }) => {
    const pathname = usePathname();
    const tourSteps = useMemo(() => pageTours[pathname] || [], [pathname]);

    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const popoverRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragInfoRef = useRef<{ startX: number; startY: number; initialTop: number; initialLeft: number; } | null>(null);

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
    
    useEffect(() => {
        const step = tourSteps[currentStep];
        if (!step) {
            onExit();
            return;
        };

        const intervalId = setInterval(() => {
            const element = document.querySelector(step.selector) as HTMLElement;
            if (element) {
                clearInterval(intervalId);
                setHighlightedElement(element);
            }
        }, 100); 

        return () => clearInterval(intervalId);
    }, [currentStep, tourSteps, onExit]);

    useLayoutEffect(() => {
        if (highlightedElement && !isDragging) {
            highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            
            const rect = highlightedElement.getBoundingClientRect();
            const padding = 10;
            
            setStyle({
                width: `${rect.width + padding * 2}px`,
                height: `${rect.height + padding * 2}px`,
                top: `${rect.top - padding}px`,
                left: `${rect.left - padding}px`,
                transition: 'all 0.3s ease-in-out',
            });
            
            const popoverEl = popoverRef.current;
            if (!popoverEl || popoverEl.offsetHeight === 0) {
              return; // Wait for the popover to render with its content
            }
            
            const popoverHeight = popoverEl.offsetHeight;
            const popoverWidth = popoverEl.offsetWidth;

            let preferredPosition = tourSteps[currentStep]?.position || 'bottom';
            const margin = 16;
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;

            const fits = {
                bottom: rect.bottom + padding + margin + popoverHeight < viewportH,
                top: rect.top - padding - margin - popoverHeight > 0,
                right: rect.right + padding + margin + popoverWidth < viewportW,
                left: rect.left - padding - margin - popoverWidth > 0,
            };

            if (!fits[preferredPosition]) {
                const fallbackOrder: ('bottom' | 'top' | 'right' | 'left')[] = ['bottom', 'top', 'right', 'left'];
                const bestFit = fallbackOrder.find(pos => fits[pos]);
                if (bestFit) preferredPosition = bestFit;
            }

            let popoverTop = 0, popoverLeft = 0;
            let transform = '';
            switch (preferredPosition) {
                case 'top': 
                    popoverTop = rect.top - padding - margin; 
                    popoverLeft = rect.left + rect.width / 2;
                    transform = 'translate(-50%, -100%)';
                    break;
                case 'right': 
                    popoverTop = rect.top + rect.height / 2; 
                    popoverLeft = rect.right + padding + margin; 
                    transform = 'translate(0, -50%)';
                    break;
                case 'left': 
                    popoverTop = rect.top + rect.height / 2; 
                    popoverLeft = rect.left - padding - margin; 
                    transform = 'translate(-100%, -50%)';
                    break;
                default: // bottom
                    popoverTop = rect.bottom + padding + margin; 
                    popoverLeft = rect.left + rect.width / 2; 
                    transform = 'translate(-50%, 0)';
                    break;
            }
             setPopoverStyle({
                top: `${popoverTop}px`,
                left: `${popoverLeft}px`,
                transform,
                opacity: 1,
                transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out, opacity 0.3s ease-in-out'
            });
        }
    }, [highlightedElement, tourSteps, currentStep, isDragging]);
    
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (popoverRef.current) {
            e.preventDefault();
            const { top, left } = popoverRef.current.getBoundingClientRect();
            dragInfoRef.current = { startX: e.clientX, startY: e.clientY, initialTop: top, initialLeft: left, };
            setIsDragging(true);
            
            // Remove transitions during drag
             setPopoverStyle(prev => ({ ...prev, transition: 'none' }));
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !dragInfoRef.current || !popoverRef.current) return;
        const dx = e.clientX - dragInfoRef.current.startX;
        const dy = e.clientY - dragInfoRef.current.startY;
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const newLeft = dragInfoRef.current.initialLeft + dx;
        const newTop = dragInfoRef.current.initialTop + dy;
        const constrainedLeft = Math.max(0, Math.min(newLeft, window.innerWidth - popoverRect.width));
        const constrainedTop = Math.max(0, Math.min(newTop, window.innerHeight - popoverRect.height));
        setPopoverStyle({ top: `${constrainedTop}px`, left: `${constrainedLeft}px`, transform: 'none', opacity: 1 });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    if (tourSteps.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                <Card className="max-w-sm">
                    <CardHeader><CardTitle>Tutorial Not Available</CardTitle><CardDescription>Sorry, a spotlight tour isn't available for this page yet.</CardDescription></CardHeader>
                    <CardFooter><Button onClick={onExit} className="w-full">Close</Button></CardFooter>
                </Card>
            </div>
        );
    }
    
    if (!highlightedElement) return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading tour...</p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50">
            <svg className="absolute inset-0 w-full h-full">
                <defs><mask id="spotlight-mask"><rect x="0" y="0" width="100%" height="100%" fill="white" /><rect x={style.left as number} y={style.top as number} width={style.width} height={style.height} rx="12" fill="black" /></mask></defs>
                <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.8" mask="url(#spotlight-mask)" />
            </svg>
            
            <div className="absolute border-2 border-primary border-dashed rounded-xl pointer-events-none" style={style} />

            <div ref={popoverRef} className={cn("absolute")} style={popoverStyle}>
                <Card className="w-72 shadow-2xl animation-fade-in">
                    <CardHeader className="cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown}>
                        <CardTitle>{tourSteps[currentStep].title}</CardTitle>
                    </CardHeader>
                    <CardContent><p>{tourSteps[currentStep].content}</p></CardContent>
                    <CardFooter className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{currentStep + 1} / {tourSteps.length}</span>
                        <div className="flex gap-2">
                           <Button size="sm" variant="ghost" onClick={handlePrev} disabled={currentStep === 0}><ArrowLeft /></Button>
                           <Button size="sm" onClick={handleNext}>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="ml-2 h-4 w-4"/></Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            
             <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white z-[52]" onClick={onExit}><X /></Button>
        </div>
    );
};
