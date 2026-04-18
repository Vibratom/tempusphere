
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    action: {
        type: 'click' | 'type';
    };
}

const appTour: TourStep[] = [
    {
        selector: '[data-spotlight="add-timezone-combobox"] button',
        title: 'Add a Timezone',
        content: "Let's start by adding a new world clock. Click here to open the timezone search.",
        position: 'bottom',
        action: { type: 'click' }
    },
    {
        selector: '[cmdk-input]',
        title: 'Search for a City',
        content: 'Now, type the name of a city you want to add, like "Paris" or "Sydney". Type at least 3 characters.',
        position: 'bottom',
        action: { type: 'type' }
    },
    {
        selector: '[data-spotlight="add-timezone-button"]',
        title: 'Confirm Addition',
        content: 'Once you select a timezone from the list (you can skip that for this demo), click the "Add" button to finish.',
        position: 'bottom',
        action: { type: 'click' }
    }
];

const pageTours: Record<string, TourStep[]> = {
    '/app': appTour,
};

export const InteractiveTour = ({ onExit }: { onExit: () => void }) => {
    const pathname = usePathname();
    const tourSteps = useMemo(() => pageTours[pathname] || [], [pathname]);

    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const popoverRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragInfoRef = useRef<{ startX: number; startY: number; initialTop: number; initialLeft: number; } | null>(null);

    const handleNext = useCallback(() => {
        setHighlightedElement(null);
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onExit();
        }
    }, [currentStep, tourSteps.length, onExit]);

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

        const actionType = step.action.type === 'type' ? 'input' : 'click';

        const actionHandler = (e: Event) => {
            if (step.action.type === 'type') {
                const input = e.target as HTMLInputElement;
                if (input.value && input.value.length > 2) {
                    handleNext();
                }
            } else { // click
                 handleNext();
            }
        };

        let element: HTMLElement | null = null;
        const intervalId = setInterval(() => {
            const foundElement = document.querySelector(step.selector) as HTMLElement;
            if (foundElement) {
                clearInterval(intervalId);
                setHighlightedElement(foundElement);
                element = foundElement;

                const listenerOptions = step.action.type === 'click' ? { once: true } : undefined;
                element.addEventListener(actionType, actionHandler, listenerOptions);
            }
        }, 100); 

        return () => {
            clearInterval(intervalId);
            if (element) {
                element.removeEventListener(actionType, actionHandler);
            }
        };
    }, [currentStep, tourSteps, onExit, handleNext]);

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
            const popoverWidth = 288;
            const popoverHeight = 250;
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
            switch (preferredPosition) {
                case 'top': popoverTop = rect.top - padding - margin; popoverLeft = rect.left + rect.width / 2; break;
                case 'right': popoverTop = rect.top + rect.height / 2; popoverLeft = rect.right + padding + margin; break;
                case 'left': popoverTop = rect.top + rect.height / 2; popoverLeft = rect.left - padding - margin; break;
                default: popoverTop = rect.bottom + padding + margin; popoverLeft = rect.left + rect.width / 2; break;
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
    
    // Drag handling logic copied from SpotlightTour
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (popoverRef.current) {
            e.preventDefault();
            const { top, left } = popoverRef.current.getBoundingClientRect();
            dragInfoRef.current = { startX: e.clientX, startY: e.clientY, initialTop: top, initialLeft: left, };
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
        const constrainedLeft = Math.max(0, Math.min(newLeft, window.innerWidth - popoverRect.width));
        const constrainedTop = Math.max(0, Math.min(newTop, window.innerHeight - popoverRect.height));
        setPopoverStyle({ top: `${constrainedTop}px`, left: `${constrainedLeft}px`, transform: 'none' });
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


    if (tourSteps.length === 0) return null;
    
    if (!highlightedElement) return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Looking for the next step...</p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50">
            <svg className="absolute inset-0 w-full h-full">
                <defs><mask id="spotlight-mask"><rect x="0" y="0" width="100%" height="100%" fill="white" /><rect x={style.left as number} y={style.top as number} width={style.width} height={style.height} rx="12" fill="black" /></mask></defs>
                <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.8" mask="url(#spotlight-mask)" />
            </svg>
            
            <div className="absolute border-2 border-primary border-dashed rounded-xl transition-all duration-500 pointer-events-none" style={style} />

            <div ref={popoverRef} className={cn("absolute", !isDragging && "transition-all duration-500")} style={popoverStyle}>
                <Card className="w-72 shadow-2xl animation-fade-in">
                    <CardHeader className="cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown}>
                         <CardTitle>{tourSteps[currentStep].title}</CardTitle>
                    </CardHeader>
                    <CardContent><p>{tourSteps[currentStep].content}</p></CardContent>
                    <CardFooter className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{currentStep + 1} / {tourSteps.length}</span>
                        <div className="flex gap-2">
                           <Button size="sm" variant="ghost" onClick={handlePrev} disabled={currentStep === 0}><ArrowLeft /></Button>
                           <Button size="sm" onClick={handleNext}>Skip <ArrowRight className="ml-2"/></Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            
             <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white" onClick={onExit}><X /></Button>
        </div>
    );
};
