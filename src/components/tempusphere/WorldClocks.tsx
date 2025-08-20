
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTime } from '@/hooks/use-time';
import { timezones } from '@/lib/timezones';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, Globe, Clock, Watch } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Combobox } from '../ui/combobox';
import { AnalogClock } from './AnalogClock';

type ClockMode = 'digital' | 'analog';

function WorldClockRow({ 
  timezone, 
  mode,
  onRemove, 
  onToggleMode,
  glass 
}: { 
  timezone: string, 
  mode: ClockMode,
  onRemove: (tz: string) => void; 
  onToggleMode: (tz: string) => void;
  glass?: boolean; 
}) {
  const time = useTime();
  const { hourFormat, showSeconds } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: hourFormat === '12h',
    timeZone: timezone,
  };
  if (showSeconds) {
    formatOptions.second = '2-digit';
  }

  const getOffset = (tz: string) => {
    if (tz === 'UTC') return 'UTC+0';
    try {
      const date = new Date();
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
      const diff = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
      return `UTC${diff >= 0 ? '+' : ''}${diff}`;
    } catch {
      return '';
    }
  };

  const timeString = isClient ? new Intl.DateTimeFormat('default', formatOptions).format(time) : '00:00:00';

  return (
      <div className={cn("flex justify-between items-center p-3 rounded-lg border", glass ? 'bg-black/10 border-white/20' : 'bg-background/50')}>
        <div>
          <p className="font-semibold text-lg">{timezone.split('/').pop()?.replace(/_/g, ' ')}</p>
          <p className="text-sm text-muted-foreground">{isClient ? getOffset(timezone) : ''}</p>
        </div>
        <div className="flex items-center gap-2">
            {mode === 'digital' ? (
              <p className="text-2xl font-mono font-semibold tabular-nums w-48 text-right">
                {timeString}
              </p>
            ) : (
              <div className="w-20 h-20">
                <AnalogClock timezone={timezone} />
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => onToggleMode(timezone)}>
                {mode === 'digital' ? <Watch className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onRemove(timezone)}>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>
  );
}

interface WorldClocksProps {
    fullscreen?: boolean;
    glass?: boolean;
}

export function WorldClocks({ fullscreen = false, glass = false }: WorldClocksProps) {
  const [selectedClocks, setSelectedClocks] = useLocalStorage<string[]>('worldclocks:list', ['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [clockModes, setClockModes] = useLocalStorage<Record<string, ClockMode>>('worldclocks:modes', {});
  const [newTimezone, setNewTimezone] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const addClock = () => {
    if (newTimezone && !selectedClocks.includes(newTimezone)) {
      setSelectedClocks([...selectedClocks, newTimezone].sort());
      setClockModes(prev => ({...prev, [newTimezone]: 'digital'}));
      setNewTimezone('');
    }
  };

  const removeClock = (tz: string) => {
    setSelectedClocks(selectedClocks.filter((t) => t !== tz));
    const newModes = {...clockModes};
    delete newModes[tz];
    setClockModes(newModes);
  };
  
  const toggleClockMode = (tz: string) => {
    setClockModes(prev => ({...prev, [tz]: prev[tz] === 'digital' ? 'analog' : 'digital' }));
  }
  
  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg flex flex-col p-4' : 'flex flex-col p-4') : '';
  
  const timezoneOptions = timezones
    .filter(tz => !selectedClocks.includes(tz))
    .map(tz => ({
        value: tz,
        label: tz.replace(/_/g, ' ')
    }));


  return (
    <Container className={cn('flex flex-col h-full', containerClass)}>
        {!fullscreen && <CardHeader>
            <CardTitle>World Clocks</CardTitle>
        </CardHeader>}
        <CardContent className={cn("flex-1 flex flex-col p-0", !fullscreen && "p-4 pt-0", fullscreen && "gap-4")}>
            {!fullscreen && <div className="flex gap-2 mb-4">
                <Combobox
                    options={timezoneOptions}
                    value={newTimezone}
                    onChange={setNewTimezone}
                    placeholder="Search for a timezone..."
                />
                <Button onClick={addClock} disabled={!newTimezone}><Plus className="mr-2 h-4 w-4"/>Add</Button>
            </div>}
            <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-4 pr-4 h-full">
                {isClient ? (
                    selectedClocks.length > 0 ? selectedClocks.map((tz) => (
                    <WorldClockRow 
                      key={tz} 
                      timezone={tz} 
                      mode={clockModes[tz] || 'digital'}
                      onRemove={removeClock} 
                      onToggleMode={toggleClockMode}
                      glass={glass} 
                    />
                    )) : 
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Globe className="w-16 h-16 mb-4" />
                      <h3 className="text-xl font-semibold">No World Clocks</h3>
                      <p className="text-sm">Add a clock using the form above.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                )}
            </div>
            </ScrollArea>
        </CardContent>
    </Container>
  );
}
