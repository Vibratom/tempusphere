
'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Upload, Crop, Sun, Sliders } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

export function ImageEditor() {
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                                    <img src={image} alt="Uploaded preview" className="max-w-full max-h-[60vh] object-contain" />
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
                                                <Slider defaultValue={[50]} disabled />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label>Contrast</Label>
                                                <Slider defaultValue={[50]} disabled />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label>Saturation</Label>
                                                <Slider defaultValue={[50]} disabled />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filters Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Sliders className="h-5 w-5" /> Filters</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" className="h-20" disabled>Original</Button>
                                            <Button variant="outline" className="h-20" disabled>Grayscale</Button>
                                            <Button variant="outline" className="h-20" disabled>Sepia</Button>
                                        </div>
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
