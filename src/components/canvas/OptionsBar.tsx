
'use client';

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Undo, Redo, Download, Settings, Home } from "lucide-react";
import Link from 'next/link';

export function OptionsBar() {
    return (
        <div className="h-14 bg-background border-b px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/"><Home/></Link>
                </Button>
                <div className="w-[1px] h-6 bg-border mx-2"></div>
                <span className="text-sm text-muted-foreground">Contextual Tool Options will appear here</span>
            </div>
            <div className="flex-1 px-8">
                <Input defaultValue="Untitled Design" className="text-lg font-semibold border-none focus-visible:ring-0 shadow-none p-0 h-auto text-center" />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Undo /></Button>
                <Button variant="ghost" size="icon"><Redo /></Button>
                <div className="w-[1px] h-6 bg-border mx-2"></div>
                <Button variant="default"><Download className="mr-2"/>Export</Button>
            </div>
        </div>
    );
}
