
'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Upload, Crop, Sun, Sliders, Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';


const filters = [
    { name: 'Original', value: 'none' },
    { name: 'Clarity', value: 'contrast(130%) saturate(110%)' },
    { name: 'cinematic', value: 'contrast(120%) saturate(120%)' },
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

// Helper to apply intensity to a filter string
const applyFilterIntensity = (filterValue: string, intensity: number): string => {
    if (filterValue === 'none') return 'none';
    const ratio = intensity / 100;
    return filterValue.replace(/([a-zA-Z-]+)\(([^)]+)\)/g, (match, func, val) => {
        const num = parseFloat(val);
        const unit = val.replace(String(num), '');
        if (['hue-rotate'].includes(func)) {
            return `${func}(${(num * ratio).toFixed(2)}${unit})`;
        }
        if (['brightness', 'contrast', 'saturate', 'opacity'].includes(func)) {
            const scaledValue = 100 + (num - 100) * ratio;
            return `${func}(${scaledValue.toFixed(2)}%)`;
        }
        return `${func}(${(num * ratio).toFixed(2)}${unit})`;
    });
};

type AspectRatio = 'free' | '1:1' | '16:9' | '4:3';
type CropAction = 'move' | 'nw' | 'ne' | 'sw' | 'se';

export function ImageEditor() {
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [hue, setHue] = useState(0);
    const [blur, setBlur] = useState(0);
    
    const [rotation, setRotation] = useState(0);
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);
    
    const [activeFilter, setActiveFilter] = useState('none');
    const [filterIntensity, setFilterIntensity] = useState(100);

    const [isCropMode, setIsCropMode] = useState(false);
    const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentage based
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
    
    const [cropAction, setCropAction] = useState<CropAction | null>(null);
    const dragStartRef = useRef<{ mouseX: number, mouseY: number, crop: typeof crop } | null>(null);

    const { toast } = useToast();

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target?.result as string);
            resetAdjustments();
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

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    
    const resetAdjustments = () => {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setHue(0);
        setBlur(0);
        setRotation(0);
        setScaleX(1);
        setScaleY(1);
        setActiveFilter('none');
        setFilterIntensity(100);
        setIsCropMode(false);
        setCrop({ x: 10, y: 10, width: 80, height: 80 });
    }

    const imageStyle = useMemo(() => {
        const appliedFilter = applyFilterIntensity(activeFilter, filterIntensity);
        return {
            filter: `${appliedFilter !== 'none' ? appliedFilter : ''} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`.trim(),
            transform: `rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
        }
    }, [activeFilter, filterIntensity, brightness, contrast, saturation, hue, blur, rotation, scaleX, scaleY]);

    const handleDownload = () => {
        if (!image) {
            toast({ variant: 'destructive', title: 'No image to download' });
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast({ variant: 'destructive', title: 'Error preparing download' });
            return;
        }

        const img = new window.Image();
        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.filter = imageStyle.filter;
            
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

            const link = document.createElement('a');
            link.download = 'edited-image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast({ title: 'Download Started' });
        };
        img.onerror = () => {
             toast({ variant: 'destructive', title: 'Error loading image' });
        };
        img.src = image;
    };
    
     const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>, action: CropAction) => {
        e.stopPropagation();
        setCropAction(action);
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            crop: { ...crop },
        };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cropAction || !dragStartRef.current) return;

        const container = imageContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const dx = (e.clientX - dragStartRef.current.mouseX) / rect.width * 100;
        const dy = (e.clientY - dragStartRef.current.mouseY) / rect.height * 100;
        const startCrop = dragStartRef.current.crop;
        let newCrop = { ...startCrop };
        
        // Apply deltas based on action
        if (cropAction === 'move') {
            newCrop.x = startCrop.x + dx;
            newCrop.y = startCrop.y + dy;
        } else {
            // Corner resizing logic
            if (cropAction.includes('w')) {
                newCrop.x = startCrop.x + dx;
                newCrop.width = startCrop.width - dx;
            }
            if (cropAction.includes('n')) {
                newCrop.y = startCrop.y + dy;
                newCrop.height = startCrop.height - dy;
            }
            if (cropAction.includes('e')) {
                newCrop.width = startCrop.width + dx;
            }
            if (cropAction.includes('s')) {
                newCrop.height = startCrop.height + dy;
            }
        }
        
        // Constrain aspect ratio
        if (aspectRatio !== 'free') {
            const ratioValue = aspectRatio === '1:1' ? 1 : aspectRatio === '16:9' ? 16 / 9 : 4 / 3;
            if (newCrop.width / newCrop.height > ratioValue) {
                newCrop.height = newCrop.width / ratioValue;
            } else {
                newCrop.width = newCrop.height * ratioValue;
            }
        }

        // Clamp values to be within bounds (0-100)
        newCrop.x = Math.max(0, Math.min(newCrop.x, 100 - newCrop.width));
        newCrop.y = Math.max(0, Math.min(newCrop.y, 100 - newCrop.height));
        newCrop.width = Math.max(5, Math.min(newCrop.width, 100 - newCrop.x));
        newCrop.height = Math.max(5, Math.min(newCrop.height, 100 - newCrop.y));

        setCrop(newCrop);
    };

    const handleMouseUp = () => {
        setCropAction(null);
    };

    const applyCrop = () => {
        if (!imageRef.current) return;
        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        const cropX = (crop.x / 100) * img.width * scaleX;
        const cropY = (crop.y / 100) * img.height * scaleY;
        const cropWidth = (crop.width / 100) * img.width * scaleX;
        const cropHeight = (crop.height / 100) * img.height * scaleY;

        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        
        setImage(canvas.toDataURL('image/png'));
        setIsCropMode(false);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove as any);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove as any);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cropAction]);

    const CropOverlay = () => {
        if (!isCropMode || !image) return null;
        
        const handleClass = "absolute w-3 h-3 bg-white rounded-full border border-gray-500";
        
        return (
            <div className="absolute inset-0">
                <div
                    className="absolute border-2 border-dashed border-white/80 bg-black/30 cursor-move"
                    style={{
                        left: `${crop.x}%`,
                        top: `${crop.y}%`,
                        width: `${crop.width}%`,
                        height: `${crop.height}%`,
                    }}
                    onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                >
                    <div onMouseDown={e => handleCropMouseDown(e, 'nw')} className={cn(handleClass, "-top-1.5 -left-1.5 cursor-nwse-resize")}></div>
                    <div onMouseDown={e => handleCropMouseDown(e, 'ne')} className={cn(handleClass, "-top-1.5 -right-1.5 cursor-nesw-resize")}></div>
                    <div onMouseDown={e => handleCropMouseDown(e, 'sw')} className={cn(handleClass, "-bottom-1.5 -left-1.5 cursor-nesw-resize")}></div>
                    <div onMouseDown={e => handleCropMouseDown(e, 'se')} className={cn(handleClass, "-bottom-1.5 -right-1.5 cursor-nwse-resize")}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="w-full max-w-7xl flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="flex-row justify-between items-center">
                            <div>
                                <CardTitle>Image Preview</CardTitle>
                                <CardDescription>Your uploaded image will appear here.</CardDescription>
                            </div>
                            <Button onClick={handleDownload} disabled={!image}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </CardHeader>
                        <CardContent ref={imageContainerRef} className="flex-1 flex items-center justify-center bg-muted/50 rounded-b-lg">
                            {image ? (
                                <div className="max-w-full max-h-full p-4 relative overflow-hidden">
                                    <img 
                                        ref={imageRef}
                                        src={image} 
                                        alt="Uploaded preview" 
                                        className="max-w-full max-h-[60vh] object-contain transition-transform"
                                        style={imageStyle}
                                    />
                                    <CropOverlay />
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

                <div className="lg:col-span-1 h-full">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Editing Tools</CardTitle>
                            <CardDescription>Adjust your image here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[65vh]">
                                <Accordion type="multiple" defaultValue={['adjustments', 'filters']} className="w-full pr-4">
                                    <AccordionItem value="crop">
                                        <AccordionTrigger className="text-base"><h4 className="font-semibold flex items-center gap-2"><Crop className="h-5 w-5" /> Crop & Transform</h4></AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid gap-4 pt-4">
                                                <Button onClick={() => setIsCropMode(!isCropMode)} variant={isCropMode ? 'secondary' : 'outline'} disabled={!image}>
                                                    {isCropMode ? 'Cancel Crop' : 'Activate Crop Tool'}
                                                </Button>
                                                {isCropMode && (
                                                    <>
                                                        <div className="grid gap-1.5">
                                                            <Label>Aspect Ratio</Label>
                                                            <ToggleGroup type="single" value={aspectRatio} onValueChange={(v) => v && setAspectRatio(v as AspectRatio)} size="sm">
                                                                <ToggleGroupItem value="free">Free</ToggleGroupItem>
                                                                <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
                                                                <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
                                                                <ToggleGroupItem value="4:3">4:3</ToggleGroupItem>
                                                            </ToggleGroup>
                                                        </div>
                                                        <Button onClick={applyCrop}>Apply Crop</Button>
                                                    </>
                                                )}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" onClick={() => setRotation(r => r - 90)} disabled={!image}><RotateCcw className="mr-2"/>-90°</Button>
                                                    <Button variant="outline" onClick={() => setRotation(r => r + 90)} disabled={!image}><RotateCw className="mr-2"/>+90°</Button>
                                                    <Button variant="outline" onClick={() => setScaleX(s => s * -1)} disabled={!image}><FlipHorizontal className="mr-2"/>Flip H</Button>
                                                    <Button variant="outline" onClick={() => setScaleY(s => s * -1)} disabled={!image}><FlipVertical className="mr-2"/>Flip V</Button>
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
                                                <div className="grid gap-1.5">
                                                    <Label>Hue</Label>
                                                    <Slider value={[hue]} onValueChange={(v) => setHue(v[0])} max={360} disabled={!image} />
                                                </div>
                                                 <div className="grid gap-1.5">
                                                    <Label>Blur</Label>
                                                    <Slider value={[blur]} onValueChange={(v) => setBlur(v[0])} max={20} disabled={!image} />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="filters">
                                        <AccordionTrigger className="text-base"><h4 className="font-semibold flex items-center gap-2"><Sliders className="h-5 w-5" /> Filters</h4></AccordionTrigger>
                                        <AccordionContent>
                                            <ScrollArea className="h-48 mt-4">
                                                <div className="grid grid-cols-3 gap-2 pr-2">
                                                    {filters.map(filter => (
                                                        <button
                                                            key={filter.name}
                                                            onClick={() => setActiveFilter(filter.value)}
                                                            className={cn("aspect-square rounded-md text-xs font-medium text-center flex items-center justify-center p-1 transition-all", activeFilter === filter.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-1 hover:ring-primary')}
                                                            disabled={!image}
                                                        >
                                                            <div className="relative w-full h-full rounded overflow-hidden">
                                                                {image && <img src={image} alt={filter.name} className="w-full h-full object-cover" style={{ filter: filter.value }} />}
                                                                <div className="absolute inset-0 bg-black/30 flex items-end justify-center">
                                                                    <p className="text-white text-[10px] p-0.5">{filter.name}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                            <div className="grid gap-1.5 pt-4">
                                                <Label>Filter Intensity</Label>
                                                <Slider value={[filterIntensity]} onValueChange={(v) => setFilterIntensity(v[0])} max={100} disabled={!image || activeFilter === 'none'} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
