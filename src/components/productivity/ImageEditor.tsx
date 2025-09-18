
'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Upload, Crop, Sun, Sliders } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { cn } from '@/lib/utils';

const filters = [
    { name: 'Original', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Invert', value: 'invert(100%)' },
    { name: 'Vintage', value: 'sepia(90%) contrast(90%) brightness(110%)' },
    { name: 'Lomo', value: 'saturate(150%) contrast(110%)' },
    { name: 'Clarity', value: 'contrast(130%) saturate(110%)' },
    { name: 'Cool', value: 'saturate(110%) contrast(90%) hue-rotate(-15deg)' },
    { name: 'Warm', value: 'sepia(40%) saturate(120%)' },
    { name: 'High Contrast', value: 'contrast(150%)' },
    { name: 'Low Contrast', value: 'contrast(70%)' },
    { name: 'Faded', value: 'opacity(70%) saturate(120%)' },
    { name: 'Cinematic', value: 'contrast(120%) saturate(120%)' },
    { name: 'Ruby', value: 'hue-rotate(-25deg) saturate(150%)' },
    { name: 'Emerald', value: 'hue-rotate(60deg) saturate(130%) contrast(90%)' },
    { name: 'Sapphire', value: 'hue-rotate(25deg) saturate(150%)' },
    { name: 'Noir', value: 'grayscale(100%) contrast(130%)' },
    { name: 'Sunny', value: 'brightness(120%) saturate(120%)' },
    { name: 'Moonlight', value: 'brightness(80%) contrast(90%) saturate(50%)' },
    { name: 'Forest', value: 'contrast(90%) brightness(90%) hue-rotate(40deg) saturate(120%)' },
    { name: 'Ocean', value: 'contrast(110%) brightness(105%) hue-rotate(-40deg) saturate(140%)' },
];

export function ImageEditor() {
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [activeFilter, setActiveFilter] = useState('none');


    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const imageStyle = {
        filter: `${activeFilter !== 'none' ? activeFilter : ''} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`.trim()
    };

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="w-full max-w-7xl flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Canvas Area */}
                <div className="lg:col-span-2 h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Image Preview</CardTitle>
                            <CardDescription>Your uploaded image will appear here.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center bg-muted/50 rounded-b-lg">
                            {image ? (
                                <div className="max-w-full max-h-full p-4">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={image} 
                                        alt="Uploaded preview" 
                                        className="max-w-full max-h-[60vh] object-contain"
                                        style={imageStyle}
                                    />
                                </div>
                            ) : (
                                <div 
                                    className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center w-full cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                >
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} accept="image/*" />
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Click or drag & drop to upload</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, or GIF</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 h-full">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Editing Tools</CardTitle>
                            <CardDescription>Adjust your image here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[65vh]">
                                <div className="space-y-6 pr-4">
                                    {/* Crop Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Crop className="h-5 w-5" /> Crop & Resize</h4>
                                        <div className="grid gap-2">
                                            <Label>Aspect Ratio</Label>
                                            <Button variant="outline" disabled>Freeform</Button>
                                        </div>
                                    </div>
                                    
                                    {/* Adjustments Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Sun className="h-5 w-5" /> Adjustments</h4>
                                        <div className="grid gap-4">
                                            <div className="grid gap-1.5">
                                                <Label>Brightness</Label>
                                                <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} max={200} disabled={!image} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label>Contrast</Label>
                                                <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} max={200} disabled={!image} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label>Saturation</Label>
                                                <Slider value={[saturation]} onValueChange={(v) => setSaturation(v[0])} max={200} disabled={!image} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filters Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Sliders className="h-5 w-5" /> Filters</h4>
                                        <ScrollArea className="h-48">
                                            <div className="grid grid-cols-3 gap-2 pr-2">
                                                {filters.map(filter => (
                                                    <button
                                                        key={filter.name}
                                                        onClick={() => setActiveFilter(filter.value)}
                                                        className={cn(
                                                            "aspect-square rounded-md text-xs font-medium text-center flex items-center justify-center p-1 transition-all",
                                                            activeFilter === filter.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-1 hover:ring-primary'
                                                        )}
                                                        disabled={!image}
                                                    >
                                                        <div className="relative w-full h-full rounded overflow-hidden">
                                                            {image ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={image} alt={filter.name} className="w-full h-full object-cover" style={{ filter: filter.value }} />
                                                            ) : (
                                                                <div className="w-full h-full bg-muted"></div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/30 flex items-end justify-center">
                                                                <p className="text-white text-[10px] p-0.5">{filter.name}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
