
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Expand, Settings, Home, Atom, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetTrigger } from '../ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { useTheme } from 'next-themes';
import { ClockSettingsPanel } from './ClockSettingsPanel';
import { cn } from '@/lib/utils';

export function Header({ tabs, className, centerContent }: { tabs?: ReactNode, className?: string, centerContent?: ReactNode }) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };
    
    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
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
                    <SheetTitle>Clock Settings</SheetTitle>
                </SheetHeader>
                <ClockSettingsPanel />
                <SheetFooter className="p-4 border-t mt-auto">
                    <SheetClose asChild>
                        <Button>Done</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );

    return (
        <header className={cn("flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30", className)}>
            <div className="flex items-center gap-3 mr-auto">
                <Link href="/" className="flex items-center gap-2 font-bold tracking-tighter text-xl">
                    <Image src="/logo.webp" alt="Tempusphere Logo" width={24} height={24} />
                    Tempusphere
                </Link>
            </div>
            
            {tabs && <div className="absolute left-1/2 -translate-x-1/2">{tabs}</div>}

            {centerContent && <div className="flex-1 flex items-center justify-center">{centerContent}</div>}

            <div className="flex items-center gap-2 ml-auto">
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
                    {isClient && (
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={toggleTheme}>
                                    {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Toggle Theme</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SettingsSheet />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Clock Settings</p>
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
