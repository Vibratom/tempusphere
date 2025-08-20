'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type HourFormat = '12h' | '24h';

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
}

const SettingsContext = createContext<Settings | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hourFormat, setHourFormat] = useLocalStorage<HourFormat>('settings:hourFormat', '24h');
  const [showSeconds, setShowSeconds] = useLocalStorage<boolean>('settings:showSeconds', true);
  const [primaryClockMode, setPrimaryClockMode] = useLocalStorage<'analog' | 'digital'>('settings:clockMode', 'digital');
  const [primaryClockTimezone, setPrimaryClockTimezone] = useLocalStorage<'local' | 'utc'>('settings:clockTimezone', 'local');
  const [primaryColor, setPrimaryColor] = useLocalStorage<string>('settings:primaryColor', '141 15% 54%');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        document.documentElement.style.setProperty('--primary', primaryColor);
    }
  }, [primaryColor]);

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
    setPrimaryColor
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
