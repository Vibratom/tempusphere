
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { ArrowLeft, ArrowRight, X, BookOpen, Map, HelpCircle, Book } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';

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
    
    const [isDragging, setIsDragging] = useState(false);
    const dragInfoRef = useRef<{ startX: number; startY: number; initialTop: number; initialLeft: number; } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    
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
        if (highlightedElement && !isDragging) {
            highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            
            const rect = highlightedElement.getBoundingClientRect();
            const padding = 10;
            
            setStyle({
                width: `${rect.width + padding * 2}px`,
                height: `${rect.height + padding * 2}px`,
                top: `${rect.top - padding}px`,
                left: `${rect.left - padding}px`,
            });
            
            let preferredPosition = tourSteps[currentStep]?.position || 'bottom';
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
    }, [highlightedElement, tourSteps, currentStep, isDragging]);
    
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (popoverRef.current) {
            e.preventDefault();
            const { top, left } = popoverRef.current.getBoundingClientRect();
            dragInfoRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                initialTop: top,
                initialLeft: left,
            };
            setIsDragging(true);
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !dragInfoRef.current || !popoverRef.current) return;

        const dx = e.clientX - dragInfoRef.current.startX;
        const dy = e.clientY - dragInfoRef.current.startY;
        
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const newLeft = dragInfoRef.current.initialLeft + dx;
        const newTop = dragInfoRef.current.initialTop + dy;

        // Constrain movement within the viewport
        const constrainedLeft = Math.max(0, Math.min(newLeft, window.innerWidth - popoverRect.width));
        const constrainedTop = Math.max(0, Math.min(newTop, window.innerHeight - popoverRect.height));

        setPopoverStyle({
            top: `${constrainedTop}px`,
            left: `${constrainedLeft}px`,
            transform: 'none', // Use absolute positioning when dragging
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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
            <div 
              ref={popoverRef}
              className={cn("absolute", !isDragging && "transition-all duration-500")}
              style={popoverStyle}
            >
                <Card className="w-72 shadow-2xl animation-fade-in">
                    <CardHeader 
                        className="cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                    >
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
                    action: () => {},
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
                    action: () => {},
                    disabled: true,
                    comingSoon: true,
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
                <SheetContent className="flex flex-col">
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
        </>
    );
}
