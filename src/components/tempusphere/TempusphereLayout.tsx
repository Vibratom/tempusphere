
'use client';

import { useState, useEffect } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { FullscreenView } from './FullscreenView';
import { Footer } from './Footer';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { TabbedPanels } from './TabbedPanels';
import { Header } from './Header';


function AppContent() {
  const [activeTab, setActiveTab] = useState('world-clocks');
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  
  const onExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };
  
  useHotkeys([
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

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <Header />
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
