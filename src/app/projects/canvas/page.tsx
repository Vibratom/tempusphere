
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraftingCompass } from 'lucide-react';

const PlaceholderTool = ({ name, icon: Icon }: { name: string, icon: React.ComponentType<any> }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <div className="mx-auto bg-muted p-4 rounded-full">
            <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mt-4">{name}</h2>
        <p className="text-muted-foreground mt-2">This tool is coming soon!</p>
    </div>
);


export default function CanvasPage() {
  return <PlaceholderTool name="Canvas" icon={DraftingCompass} />;
}
