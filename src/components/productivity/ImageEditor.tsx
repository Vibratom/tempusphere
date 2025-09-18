
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Upload } from 'lucide-react';

export function ImageEditor() {
    return (
        <div className="w-full max-w-4xl mx-auto">
             <Card>
                <CardHeader>
                    <CardTitle>Image Editor</CardTitle>
                    <CardDescription>Upload an image to start editing. (Functionality coming soon)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Upload an Image</h3>
                        <p className="mt-1 text-sm text-muted-foreground">This feature is under construction.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
