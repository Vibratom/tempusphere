
'use client';

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Undo, Redo, Download, Settings } from "lucide-react";

export function TopToolbar() {
    return (
        <div className="h-14 bg-background border-b px-4 flex items-center justify-between">
            <div className="flex-1 pr-8">
                <Input defaultValue="Untitled Design" className="text-lg font-semibold border-none focus-visible:ring-0 shadow-none p-0 h-auto" />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Undo /></Button>
                <Button variant="ghost" size="icon"><Redo /></Button>
                <div className="w-[1px] h-6 bg-border mx-2"></div>
                <Button variant="ghost"><Download className="mr-2"/>Export</Button>
                <Button variant="ghost" size="icon"><Settings /></Button>
            </div>
        </div>
    );
}
