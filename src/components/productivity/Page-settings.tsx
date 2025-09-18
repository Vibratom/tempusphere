
'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useProductivity, PageSize, PageOrientation } from '@/contexts/ProductivityContext';
import { Card, CardContent } from '../ui/card';

const pagePresets: Record<PageSize, { width: number; height: number }> = {
    'A4': { width: 2480, height: 3508 },
    'Letter': { width: 2550, height: 3300 },
    'Widescreen': { width: 1920, height: 1080 },
};

export function PageSettings() {
    const { canvasState, setCanvasState } = useProductivity();
    const { page } = canvasState;

    const handleSizeChange = (size: PageSize) => {
        const newWidth = pagePresets[size].width;
        const newHeight = pagePresets[size].height;
        setCanvasState(prev => ({
            ...prev,
            page: {
                ...prev.page,
                size: size,
                width: prev.page.orientation === 'Landscape' ? Math.max(newWidth, newHeight) : Math.min(newWidth, newHeight),
                height: prev.page.orientation === 'Landscape' ? Math.min(newWidth, newHeight) : Math.max(newWidth, newHeight),
            }
        }));
    };

    const handleOrientationChange = (orientation: PageOrientation) => {
        setCanvasState(prev => ({
            ...prev,
            page: {
                ...prev.page,
                orientation,
                width: orientation === 'Landscape' ? Math.max(prev.page.width, prev.page.height) : Math.min(prev.page.width, prev.page.height),
                height: orientation === 'Landscape' ? Math.min(prev.page.width, prev.page.height) : Math.max(prev.page.width, prev.page.height),
            }
        }));
    };

    return (
        <div className="p-4 space-y-4">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="grid gap-1.5">
                        <Label>Page Size</Label>
                        <Select value={page.size} onValueChange={(v) => handleSizeChange(v as PageSize)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Widescreen">Widescreen (16:9)</SelectItem>
                                <SelectItem value="A4">A4</SelectItem>
                                <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Dimensions</Label>
                        <div className="grid grid-cols-2 gap-2">
                           <Input value={`${page.width} px`} readOnly />
                           <Input value={`${page.height} px`} readOnly />
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Orientation</Label>
                         <div className="grid grid-cols-2 gap-2">
                             <Button 
                                variant={page.orientation === 'Portrait' ? 'secondary' : 'outline'}
                                onClick={() => handleOrientationChange('Portrait')}
                             >
                                Portrait
                             </Button>
                             <Button 
                                variant={page.orientation === 'Landscape' ? 'secondary' : 'outline'}
                                onClick={() => handleOrientationChange('Landscape')}
                            >
                                Landscape
                            </Button>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
