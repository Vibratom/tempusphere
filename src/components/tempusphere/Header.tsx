
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Expand, Settings, Home, Atom } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetTrigger } from '../ui/sheet';
import { SettingsPanel } from './SettingsPanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useHotkeys } from '@/hooks/use-hotkeys';

export function Header() {
    const [settingsOpen, setSettingsOpen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    useHotkeys([['f', toggleFullscreen]]);

    const SettingsSheet = () => (
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Settings</SheetTitle>
                </SheetHeader>
                <SettingsPanel />
                <SheetFooter className="p-4 border-t mt-auto">
                    <SheetClose asChild>
                        <Button>Done</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );

    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3 mr-auto">
                <Link href="/" className="flex items-center gap-2 font-bold tracking-tighter text-xl">
                    <Clock />
                    Tempusphere
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button asChild variant="outline" size="icon">
                                <Link href="https://www.vibratomstudios.com/" target="_blank"><Atom className="h-5 w-5" /></Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Vibratom Studios</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="outline" size="icon">
                                <Link href="/"><Home className="h-5 w-5" /></Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Homepage</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SettingsSheet />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                                <Expand className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Fullscreen (F)</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </header>
    );
}
