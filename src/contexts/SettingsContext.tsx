
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type HourFormat = '12h' | '24h';
type LayoutMode = 'default' | 'sidebar-left' | 'sidebar-right' | 'minimal';

export interface FullscreenSettings {
  primaryClock: boolean;
  worldClocks: boolean;
  alarms: boolean;
  stopwatch: boolean;
  timer: boolean;
}

interface Settings {
  hourFormat: HourFormat;
  setHourFormat: Dispatch<SetStateAction<HourFormat>>;
  showSeconds: boolean;
  setShowSeconds: Dispatch<SetStateAction<boolean>>;
  primaryClockMode: 'analog' | 'digital';
  setPrimaryClockMode: Dispatch<SetStateAction<'analog' | 'digital'>>;
  primaryClockTimezone: 'local' | 'utc';
  setPrimaryClockTimezone: Dispatch<SetStateAction<'local' | 'utc'>>;
  primaryColor: string;
  setPrimaryColor: Dispatch<SetStateAction<string>>;
  accentColor: string;
  setAccentColor: Dispatch<SetStateAction<string>>;
  backgroundColor: string;
  setBackgroundColor: Dispatch<SetStateAction<string>>;
  backgroundImage: string | null;
  setBackgroundImage: Dispatch<SetStateAction<string | null>>;
  clockSize: number;
  setClockSize: Dispatch<SetStateAction<number>>;
  fullscreenSettings: FullscreenSettings;
  setFullscreenSettings: Dispatch<SetStateAction<FullscreenSettings>>;
  layout: LayoutMode;
  setLayout: Dispatch<SetStateAction<LayoutMode>>;
}

const SettingsContext = createContext<Settings | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hourFormat, setHourFormat] = useLocalStorage<HourFormat>('settings:hourFormat', '24h');
  const [showSeconds, setShowSeconds] = useLocalStorage<boolean>('settings:showSeconds', true);
  const [primaryClockMode, setPrimaryClockMode] = useLocalStorage<'analog' | 'digital'>('settings:clockMode', 'digital');
  const [primaryClockTimezone, setPrimaryClockTimezone] = useLocalStorage<'local' | 'utc'>('settings:clockTimezone', 'local');
  const [primaryColor, setPrimaryColor] = useLocalStorage<string>('settings:primaryColor', '141 15% 54%');
  const [accentColor, setAccentColor] = useLocalStorage<string>('settings:accentColor', '5 41% 49%');
  const [backgroundColor, setBackgroundColor] = useLocalStorage<string>('settings:backgroundColor', '210 20% 96%');
  const [backgroundImage, setBackgroundImage] = useLocalStorage<string | null>('settings:backgroundImage', null);
  const [clockSize, setClockSize] = useLocalStorage<number>('settings:clockSize', 100);
  const [fullscreenSettings, setFullscreenSettings] = useLocalStorage<FullscreenSettings>('settings:fullscreen', {
    primaryClock: true,
    worldClocks: true,
    alarms: false,
    stopwatch: false,
    timer: false,
  });
  const [layout, setLayout] = useLocalStorage<LayoutMode>('settings:layout', 'default');


  useEffect(() => {
    if (typeof window !== 'undefined') {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--accent', accentColor);
        document.documentElement.style.setProperty('--background', backgroundColor);
    }
  }, [primaryColor, accentColor, backgroundColor]);

  const value = {
    hourFormat,
    setHourFormat,
    showSeconds,
    setShowSeconds,
    primaryClockMode,
    setPrimaryClockMode,
    primaryClockTimezone,
    setPrimaryClockTimezone,
    primaryColor,
    setPrimaryColor,
    accentColor,
    setAccentColor,
    backgroundColor,
    setBackgroundColor,
    backgroundImage,
    setBackgroundImage,
    clockSize,
    setClockSize,
    fullscreenSettings,
    setFullscreenSettings,
    layout,
    setLayout
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
