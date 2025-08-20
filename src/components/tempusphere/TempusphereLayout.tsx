
'use client';

import { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { FullscreenView } from './FullscreenView';
import { Footer } from './Footer';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Expand, Menu, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { TabbedPanels } from './TabbedPanels';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetTrigger } from '../ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { SettingsPanel } from './SettingsPanel';


function AppContent() {
  const [activeTab, setActiveTab] = useState('world-clocks');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { layout } = useSettings();
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            { isMobile && (layout === 'sidebar-left' || layout === 'sidebar-right') && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side={layout === 'sidebar-left' ? 'left' : 'right'} className="p-0 w-full max-w-sm">
                        <Sidebar 
                            header={<div className="h-16 border-b flex items-center px-4"><h2 className="text-xl font-bold">Menu</h2></div>} 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                            onTabChange={() => setMobileMenuOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
            ) }
          <h1 className="text-2xl font-bold tracking-tighter">Tempusphere</h1>
        </div>
        <div className="flex items-center gap-2">
            <TooltipProvider>
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

  const mainContent = (
    <div className={cn(
        "flex-grow flex flex-col items-center justify-center w-full",
        (layout === 'minimal' || showSidebar) && 'py-8'
    )}>
        <div className="flex-1 flex justify-center items-center w-full p-4 md:p-8">
            <PrimaryClock />
        </div>
        {layout === 'default' && (
            <div className="w-full max-w-5xl flex-1 flex flex-col p-4 md:p-8 pt-0 md:pt-0">
                <TabbedPanels activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        )}
    </div>
  );
  
  const showSidebar = (layout === 'sidebar-left' || layout === 'sidebar-right') && !isMobile;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
        <div className={cn("flex flex-1", layout === 'sidebar-right' ? "flex-row-reverse" : "flex-row")}>
            {showSidebar && (
                <Sidebar 
                    header={header} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                />
            )}
            <div className="flex-1 flex flex-col overflow-y-auto max-h-screen">
                {!showSidebar && header}
                {mainContent}
                <Footer />
            </div>
        </div>
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
