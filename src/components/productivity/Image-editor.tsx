
'use client';

import React from 'react';
import { Crop, Sun, Sliders, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useProductivity, ImageObject, CanvasObject } from '@/contexts/ProductivityContext';

const filters = [
    { name: 'Original', value: 'none' },
    { name: 'Clarity', value: 'contrast(130%) saturate(110%)' },
    { name: 'Cinematic', value: 'contrast(120%) saturate(120%)' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Noir', value: 'grayscale(100%) contrast(130%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Vintage', value: 'sepia(90%) contrast(90%) brightness(110%)' },
    { name: 'Lomo', value: 'saturate(150%) contrast(110%)' },
    { name: 'Cool', value: 'saturate(110%) contrast(90%) hue-rotate(-15deg)' },
    { name: 'Warm', value: 'sepia(40%) saturate(120%)' },
    { name: 'Sunny', value: 'brightness(120%) saturate(120%)' },
    { name: 'Moonlight', value: 'brightness(80%) contrast(90%) saturate(50%)' },
    { name: 'Forest', value: 'contrast(90%) brightness(90%) hue-rotate(40deg) saturate(120%)' },
    { name: 'Ocean', value: 'contrast(110%) brightness(105%) hue-rotate(-40deg) saturate(140%)' },
    { name: 'Invert', value: 'invert(100%)' },
    { name: 'High Contrast', value: 'contrast(150%)' },
    { name: 'Low Contrast', value: 'contrast(70%)' },
    { name: 'Faded', value: 'opacity(70%) saturate(120%)' },
    { name: 'Ruby', value: 'hue-rotate(-25deg) saturate(150%)' },
    { name: 'Emerald', value: 'hue-rotate(60deg) saturate(130%) contrast(90%)' },
    { name: 'Sapphire', value: 'hue-rotate(25deg) saturate(150%)' },
    { name: 'Sunset', value: 'sepia(50%) contrast(120%) hue-rotate(-20deg) saturate(150%)' },
    { name: 'Twilight', value: 'contrast(110%) saturate(160%) hue-rotate(-60deg) brightness(90%)' },
    { name: 'Aurora', value: 'contrast(110%) saturate(200%) hue-rotate(90deg)' },
    { name: 'Crimson', value: 'sepia(30%) saturate(200%) hue-rotate(-40deg)' },
    { name: 'Neon', value: 'saturate(200%) contrast(150%)' },
];


export function ImageEditor({ selectedImage }: { selectedImage: ImageObject }) {
    const { canvasState, setCanvasState } = useProductivity();
    
    // --- History Management ---
    const updateHistoryWithChange = (newObjects: CanvasObject[]) => {
        const { slides, activeSlideId } = canvasState;
        const activeSlide = slides.find(s => s.id === activeSlideId);
        if (!activeSlide) return;

        const newHistory = [...activeSlide.history.slice(0, activeSlide.historyIndex + 1), { objects: newObjects }];

        setCanvasState(prev => ({
            ...prev,
            slides: prev.slides.map(slide => 
                slide.id === activeSlideId 
                ? { ...slide, objects: newObjects, history: newHistory, historyIndex: newHistory.length - 1 }
                : slide
            )
        }));
    };

    const updateImageState = (id: string, updates: Partial<ImageObject>, finalizeHistory: boolean = false) => {
        setCanvasState(prev => {
            const newSlides = prev.slides.map(slide => {
                if (slide.id === prev.activeSlideId) {
                    const newObjects = slide.objects.map(obj => {
                        if (obj.id === id && obj.type === 'IMAGE') {
                            return { ...obj, ...updates };
                        }
                        return obj;
                    });
                    
                    if (finalizeHistory) {
                        const newHistory = [...slide.history.slice(0, slide.historyIndex + 1), { objects: newObjects }];
                        return { ...slide, objects: newObjects, history: newHistory, historyIndex: newHistory.length - 1 };
                    }
                    
                    return { ...slide, objects: newObjects };
                }
                return slide;
            });
            return { ...prev, slides: newSlides };
        });
    };

    const handleValueChange = (property: keyof ImageObject, value: any) => {
        updateImageState(selectedImage.id, { [property]: value });
    };

    const handleSliderCommit = (property: keyof ImageObject, value: any) => {
        updateImageState(selectedImage.id, { [property]: value }, true);
    }
    
    const handleTransform = (property: keyof ImageObject, value: any) => {
        updateImageState(selectedImage.id, { [property]: value }, true);
    }

    const {
        brightness = 100,
        contrast = 100,
        saturation = 100,
        hue = 0,
        blur = 0,
        rotation = 0,
        scaleX = 1,
        scaleY = 1,
        activeFilter = 'none',
        filterIntensity = 100
    } = selectedImage;

    return (
        <Accordion type="multiple" defaultValue={['adjustments', 'filters']} className="w-full">
            <AccordionItem value="crop">
                <AccordionTrigger className="text-base"><h4 className="font-semibold flex items-center gap-2"><Crop className="h-5 w-5" /> Crop & Transform</h4></AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4 pt-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" onClick={() => handleTransform('rotation', (rotation || 0) - 90)}><RotateCcw className="mr-2"/>-90°</Button>
                            <Button variant="outline" onClick={() => handleTransform('rotation', (rotation || 0) + 90)}><RotateCw className="mr-2"/>+90°</Button>
                            <Button variant="outline" onClick={() => handleTransform('scaleX', (scaleX || 1) * -1)}><FlipHorizontal className="mr-2"/>Flip H</Button>
                            <Button variant="outline" onClick={() => handleTransform('scaleY', (scaleY || 1) * -1)}><FlipVertical className="mr-2"/>Flip V</Button>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="adjustments">
                <AccordionTrigger className="text-base"><h4 className="font-semibold flex items-center gap-2"><Sun className="h-5 w-5" /> Adjustments</h4></AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4 pt-4">
                        <div className="grid gap-1.5">
                            <Label>Brightness</Label>
                            <Slider value={[brightness]} onValueChange={(v) => handleValueChange('brightness', v[0])} onValueCommit={(v) => handleSliderCommit('brightness', v[0])} max={200} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Contrast</Label>
                            <Slider value={[contrast]} onValueChange={(v) => handleValueChange('contrast', v[0])} onValueCommit={(v) => handleSliderCommit('contrast', v[0])} max={200} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Saturation</Label>
                            <Slider value={[saturation]} onValueChange={(v) => handleValueChange('saturation', v[0])} onValueCommit={(v) => handleSliderCommit('saturation', v[0])} max={200} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Hue</Label>
                            <Slider value={[hue]} onValueChange={(v) => handleValueChange('hue', v[0])} onValueCommit={(v) => handleSliderCommit('hue', v[0])} max={360} />
                        </div>
                            <div className="grid gap-1.5">
                            <Label>Blur</Label>
                            <Slider value={[blur]} onValueChange={(v) => handleValueChange('blur', v[0])} onValueCommit={(v) => handleSliderCommit('blur', v[0])} max={20} />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="filters">
                <AccordionTrigger className="text-base"><h4 className="font-semibold flex items-center gap-2"><Sliders className="h-5 w-5" /> Filters</h4></AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-3 gap-2 pr-2 mt-4">
                        {filters.map(filter => (
                            <button
                                key={filter.name}
                                onClick={() => handleTransform('activeFilter', filter.value)}
                                className={cn("aspect-square rounded-md text-xs font-medium text-center flex items-center justify-center p-1 transition-all", activeFilter === filter.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-1 hover:ring-primary')}
                            >
                                <div className="relative w-full h-full rounded overflow-hidden">
                                    <div className="w-full h-full bg-muted" />
                                    <div className="absolute inset-0 bg-black/30 flex items-end justify-center">
                                        <p className="text-white text-[10px] p-0.5">{filter.name}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="grid gap-1.5 pt-4">
                        <Label>Filter Intensity</Label>
                        <Slider 
                            value={[filterIntensity]} 
                            onValueChange={(v) => handleValueChange('filterIntensity', v[0])} 
                            onValueCommit={(v) => handleSliderCommit('filterIntensity', v[0])}
                            max={100} 
                            disabled={activeFilter === 'none'} 
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
