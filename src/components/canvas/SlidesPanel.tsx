
'use client';

import React from 'react';
import { useProductivity } from '@/contexts/ProductivityContext';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export function SlidesPanel() {
    const { canvasState, setCanvasState } = useProductivity();
    const { slides, activeSlideId } = canvasState;

    const addSlide = () => {
        const newSlide = {
            id: uuidv4(),
            objects: [],
            history: [{ objects: [] }],
            historyIndex: 0,
        };
        const activeIndex = slides.findIndex(s => s.id === activeSlideId);
        const newSlides = [...slides];
        newSlides.splice(activeIndex + 1, 0, newSlide);

        setCanvasState(prev => ({
            ...prev,
            slides: newSlides,
            activeSlideId: newSlide.id,
        }));
    };

    const deleteSlide = (slideId: string) => {
        if (slides.length <= 1) return; // Cannot delete the last slide

        let newActiveSlideId = activeSlideId;
        const slideIndex = slides.findIndex(s => s.id === slideId);
        
        if (slideId === activeSlideId) {
            if (slideIndex > 0) {
                newActiveSlideId = slides[slideIndex - 1].id;
            } else {
                newActiveSlideId = slides[slideIndex + 1].id;
            }
        }
        
        setCanvasState(prev => ({
            ...prev,
            slides: prev.slides.filter(s => s.id !== slideId),
            activeSlideId: newActiveSlideId,
        }));
    };

    const selectSlide = (slideId: string) => {
        setCanvasState(prev => ({...prev, activeSlideId: slideId}));
    };

    return (
        <div className="h-28 md:h-24 bg-background border-t p-2 flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" className="h-full w-20 md:w-24 flex-col gap-1 flex-shrink-0" onClick={addSlide}>
                <Plus className="h-5 w-5"/>
                <span className="text-xs">New Slide</span>
            </Button>
            <ScrollArea className="h-full flex-1 whitespace-nowrap">
                <div className="flex h-full items-center gap-3">
                    {slides.map((slide, index) => (
                        <div 
                            key={slide.id}
                            className={cn(
                                "h-full aspect-video rounded-md border-2 bg-white flex-shrink-0 cursor-pointer relative group",
                                slide.id === activeSlideId ? 'border-primary' : 'border-border'
                            )}
                            onClick={() => selectSlide(slide.id)}
                        >
                            <span className="absolute bottom-1 left-2 text-xs font-semibold">{index + 1}</span>
                             <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }}
                                disabled={slides.length <= 1}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                            {/* In a real app, this would be a thumbnail of the canvas */}
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
