
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTheme } from 'next-themes';

type HourFormat = '12h' | '24h';

export interface FullscreenSettings {
  primaryClock: boolean;
  worldClocks: boolean;
  alarms: boolean;
  stopwatch: boolean;
  timer: boolean;
  converter: boolean;
  planner: boolean;
  calendar: boolean;
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
  lightBackgroundColor: string;
  setLightBackgroundColor: Dispatch<SetStateAction<string>>;
  darkBackgroundColor: string;
  setDarkBackgroundColor: Dispatch<SetStateAction<string>>;
  backgroundImage: string | null;
  setBackgroundImage: Dispatch<SetStateAction<string | null>>;
  clockSize: number;
  setClockSize: Dispatch<SetStateAction<number>>;
  fullscreenSettings: FullscreenSettings;
  setFullscreenSettings: Dispatch<SetStateAction<FullscreenSettings>>;
  spoonacularApiKey: string;
  setSpoonacularApiKey: Dispatch<SetStateAction<string>>;
  usdaApiKey: string;
  setUsdaApiKey: Dispatch<SetStateAction<string>>;
}

const SettingsContext = createContext<Settings | undefined>(undefined);

// Helper function to get luminance from HSL string
function getLuminance(hsl: string): number {
    const [h, s, l] = hsl.match(/\d+/g)!.map(Number);
    return l;
}


export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hourFormat, setHourFormat] = useLocalStorage<HourFormat>('settings:hourFormat', '24h');
  const [showSeconds, setShowSeconds] = useLocalStorage<boolean>('settings:showSeconds', true);
  const [primaryClockMode, setPrimaryClockMode] = useLocalStorage<'analog' | 'digital'>('settings:clockMode', 'digital');
  const [primaryClockTimezone, setPrimaryClockTimezone] = useLocalStorage<'local' | 'utc'>('settings:clockTimezone', 'local');
  const [primaryColor, setPrimaryColor] = useLocalStorage<string>('settings:primaryColor', '130 50% 50%');
  const [accentColor, setAccentColor] = useLocalStorage<string>('settings:accentColor', '340 80% 60%');
  const [lightBackgroundColor, setLightBackgroundColor] = useLocalStorage<string>('settings:lightBackgroundColor', '50 100% 96%');
  const [darkBackgroundColor, setDarkBackgroundColor] = useLocalStorage<string>('settings:darkBackgroundColor', '260 20% 10%');
  const [backgroundImage, setBackgroundImage] = useLocalStorage<string | null>('settings:backgroundImage', null);
  const [clockSize, setClockSize] = useLocalStorage<number>('settings:clockSize', 100);
  const [fullscreenSettings, setFullscreenSettings] = useLocalStorage<FullscreenSettings>('settings:fullscreen', {
    primaryClock: true,
    worldClocks: true,
    alarms: false,
    stopwatch: false,
    timer: false,
    converter: false,
    planner: false,
    calendar: false,
  });
  const [spoonacularApiKey, setSpoonacularApiKey] = useLocalStorage<string>('settings:spoonacularKey', '');
  const [usdaApiKey, setUsdaApiKey] = useLocalStorage<string>('settings:usdaKey', '');
  const { resolvedTheme } = useTheme();


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const isDark = resolvedTheme === 'dark';
        const currentBgColor = isDark ? darkBackgroundColor : lightBackgroundColor;
        const luminance = getLuminance(currentBgColor);
        // Determine foreground color based on background luminance
        const foregroundColor = luminance > 50 ? '30 20% 20%' : '260 10% 95%';

        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--accent', accentColor);
        document.documentElement.style.setProperty('--background', currentBgColor);
        document.documentElement.style.setProperty('--foreground', foregroundColor);
        
        if (isDark) {
            document.documentElement.style.setProperty('--card', '260 20% 12%');
            document.documentElement.style.setProperty('--popover', '260 20% 10%');
            document.documentElement.style.setProperty('--secondary', '260 20% 18%');
            document.documentElement.style.setProperty('--muted', '260 15% 25%');
            document.documentElement.style.setProperty('--border', '260 15% 25%');
            document.documentElement.style.setProperty('--input', '260 15% 25%');
        } else {
            document.documentElement.style.setProperty('--card', '50 100% 99%');
            document.documentElement.style.setProperty('--popover', '50 100% 99%');
            document.documentElement.style.setProperty('--secondary', '50 30% 92%');
            document.documentElement.style.setProperty('--muted', '50 30% 92%');
            document.documentElement.style.setProperty('--border', '50 30% 88%');
            document.documentElement.style.setProperty('--input', '50 30% 90%');
        }
    }
  }, [primaryColor, accentColor, lightBackgroundColor, darkBackgroundColor, resolvedTheme]);

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
    lightBackgroundColor,
    setLightBackgroundColor,
    darkBackgroundColor,
    setDarkBackgroundColor,
    backgroundImage,
    setBackgroundImage,
    clockSize,
    setClockSize,
    fullscreenSettings,
    setFullscreenSettings,
    spoonacularApiKey,
    setSpoonacularApiKey,
    usdaApiKey,
    setUsdaApiKey,
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
