'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTime } from '@/hooks/use-time';
import { timezones } from '@/lib/timezones';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Skeleton } from '../ui/skeleton';

function WorldClockRow({ timezone, onRemove }: { timezone: string, onRemove: (tz: string) => void; }) {
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
      <div className="flex justify-between items-center p-3 rounded-lg bg-card border">
        <div>
          <p className="font-semibold text-lg">{timezone.split('/').pop()?.replace(/_/g, ' ')}</p>
          <p className="text-sm text-muted-foreground">{isClient ? getOffset(timezone) : ''}</p>
        </div>
        <div className="flex items-center gap-4">
            <p className="text-2xl font-mono font-semibold tabular-nums">
              {timeString}
            </p>
            <Button variant="ghost" size="icon" onClick={() => onRemove(timezone)}>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>
  );
}

interface WorldClocksProps {
    fullscreen?: boolean;
}

export function WorldClocks({ fullscreen = false }: WorldClocksProps) {
  const [selectedClocks, setSelectedClocks] = useLocalStorage<string[]>('worldclocks:list', ['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [newTimezone, setNewTimezone] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const addClock = () => {
    if (newTimezone && !selectedClocks.includes(newTimezone)) {
      setSelectedClocks([...selectedClocks, newTimezone].sort());
      setNewTimezone('');
    }
  };

  const removeClock = (tz: string) => {
    setSelectedClocks(selectedClocks.filter((t) => t !== tz));
  };
  
  const content = (
    <>
        <CardHeader>
            <CardTitle>World Clocks</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2 mb-4">
            <Select value={newTimezone} onValueChange={setNewTimezone}>
                <SelectTrigger>
                <SelectValue placeholder="Add a timezone" />
                </SelectTrigger>
                <SelectContent>
                <ScrollArea className="h-72">
                    {timezones.filter(tz => !selectedClocks.includes(tz)).map((tz) => (
                    <SelectItem key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                    </SelectItem>
                    ))}
                </ScrollArea>
                </SelectContent>
            </Select>
            <Button onClick={addClock} disabled={!newTimezone}><Plus className="mr-2 h-4 w-4"/>Add</Button>
            </div>
            <ScrollArea className="h-72">
            <div className="space-y-4 pr-4">
                {isClient ? (
                    selectedClocks.length > 0 ? selectedClocks.map((tz) => (
                    <WorldClockRow key={tz} timezone={tz} onRemove={removeClock} />
                    )) : <p className="text-muted-foreground text-center pt-8">No world clocks added.</p>
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
    </>
  );

  return fullscreen ? <div className="bg-card rounded-lg border h-full flex flex-col">{content}</div> : <Card>{content}</Card>;
}
