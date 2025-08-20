
'use client';

import { useState, useEffect } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { FullscreenView } from './FullscreenView';
import { Footer } from './Footer';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Expand, Settings, Home, Clock } from 'lucide-react';
import { TabbedPanels } from './TabbedPanels';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetTrigger } from '../ui/sheet';
import { SettingsPanel } from './SettingsPanel';
import Link from 'next/link';


function AppContent() {
  const [activeTab, setActiveTab] = useState('world-clocks');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
  
  const onExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };
  
  useHotkeys([
    ['f', toggleFullscreen],
    ['Escape', onExitFullscreen],
  ]);


  if (!isClient) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col" />
    );
  }

  if (isFullscreen) {
    return <FullscreenView onExit={onExitFullscreen}/>
  }
  
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
  )

  const header = (
     <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3 mr-auto">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tighter text-xl">
            <Clock/>
            Tempusphere
          </Link>
        </div>
        <div className="flex items-center gap-2">
            <TooltipProvider>
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
                        <SettingsSheet/>
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

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {header}
      <main className="flex-1 flex flex-col items-center">
        <div className="flex justify-center items-center w-full p-4 md:p-8">
            <PrimaryClock />
        </div>
        <div className="w-full max-w-5xl flex-1 flex flex-col p-4 md:p-8 pt-0 md:pt-0">
            <TabbedPanels activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function TempusphereLayout() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
