
'use client';

import { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { FullscreenView } from './FullscreenView';
import { AppLogo } from './AppLogo';
import { Footer } from './Footer';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Expand } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { TABS, TabbedPanels } from './TabbedPanels';


function AppContent() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { layout } = useSettings();
  const [isClient, setIsClient] = useState(false);

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
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
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
    ['F', toggleFullscreen],
    ['Escape', onExitFullscreen],
  ]);


  if (isFullscreen) {
    return <FullscreenView onExit={onExitFullscreen}/>
  }

  const header = (
     <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <AppLogo className="h-6 w-6" />
          <h1 className="text-xl font-semibold tracking-tighter">Tempusphere</h1>
        </div>
        <div className="flex-1" />
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                        <Expand className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Fullscreen (F)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </header>
  );

  if (!isClient) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col">
        {header}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
        { layout !== 'sidebar-left' && layout !== 'sidebar-right' && header }
        <div className={cn("flex flex-1", layout === 'sidebar-right' ? "flex-row-reverse" : "flex-row")}>
            {(layout === 'sidebar-left' || layout === 'sidebar-right') && <Sidebar header={header} />}
            <div className="flex-1 flex flex-col">
                <main className={cn(
                  "flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8",
                  (layout === 'sidebar-left' || layout === 'sidebar-right') && "h-full"
                )}>
                    <PrimaryClock />
                    {layout !== 'minimal' && (
                        <TabbedPanels activeTab={activeTab} setActiveTab={setActiveTab} />
                    )}
                </main>
                 <Footer />
            </div>
        </div>
    </div>
  )
}

export function TempusphereLayout() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
