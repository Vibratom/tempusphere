
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { timezones } from '@/lib/timezones';
import { Combobox } from '../ui/combobox';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

// Extend Date to support IANA timezones
function getLocalTime(date: Date, time: string, timeZone: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    
    // Create a date object in the source timezone by manipulating the string
    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false, timeZone
    });
    
    const parts = formatter.formatToParts(new Date(`${dateString}Z`));
    const tzDate = new Date(dateString);
    
    // This is a simplified way to create a date that "looks like" it's in a timezone.
    // Real timezone-aware date manipulation is complex.
    const tempDate = new Date(Date.UTC(year, month, day, hours, minutes));
    
    // Find offset by comparing to UTC
    const utcDate = new Date(tempDate.toLocaleString('en-US', {timeZone: 'UTC'}));
    const tzDateForOffset = new Date(tempDate.toLocaleString('en-US', {timeZone}));
    const offset = (tzDateForOffset.getTime() - utcDate.getTime());

    return new Date(tempDate.getTime() - offset);
}

interface ConverterPanelProps {
  fullscreen?: boolean;
  glass?: boolean;
}

export function ConverterPanel({ fullscreen = false, glass = false }: ConverterPanelProps) {
  const [sourceDate, setSourceDate] = useState<Date>(new Date());
  const [sourceTime, setSourceTime] = useState('12:00');
  const [sourceTz, setSourceTz] = useState('UTC');
  const [targetTzs, setTargetTzs] = useState<string[]>(['America/New_York', 'Europe/London']);
  const [newTargetTz, setNewTargetTz] = useState('');
  
  const addTargetTz = () => {
    if (newTargetTz && !targetTzs.includes(newTargetTz)) {
      setTargetTzs([...targetTzs, newTargetTz]);
      setNewTargetTz('');
    }
  };

  const removeTargetTz = (tz: string) => {
    setTargetTzs(targetTzs.filter(t => t !== tz));
  };
  
  const availableTimezones = timezones.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }));
  const availableTargetTzs = timezones.filter(tz => !targetTzs.includes(tz) && tz !== sourceTz).map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }));

  const baseDate = getLocalTime(sourceDate, sourceTime, sourceTz);
  
  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg' : 'bg-transparent') : '';


  return (
    <Container className={cn('h-full flex flex-col', containerClass)}>
      {!fullscreen && <CardHeader>
        <CardTitle>Time Zone Converter</CardTitle>
      </CardHeader>}
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
           <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sourceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sourceDate ? format(sourceDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={sourceDate}
                  onSelect={(d) => d && setSourceDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input type="time" value={sourceTime} onChange={e => setSourceTime(e.target.value)} />
            <Combobox options={availableTimezones} value={sourceTz} onChange={setSourceTz} placeholder="Source timezone..." />
        </div>
        
        <div className="flex gap-2">
            <Combobox options={availableTargetTzs} value={newTargetTz} onChange={setNewTargetTz} placeholder="Add target timezone..." />
            <Button onClick={addTargetTz} disabled={!newTargetTz}><Plus className="mr-2 h-4 w-4" />Add</Button>
        </div>
        
        <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-2 pr-4">
                {targetTzs.map(tz => {
                    const formatter = new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: tz,
                        timeZoneName: 'short',
                    });
                    const formatted = formatter.format(baseDate);

                    return (
                        <div key={tz} className="flex justify-between items-center p-3 rounded-lg border bg-background/50">
                            <div>
                                <p className="font-semibold text-lg">{tz.split('/').pop()?.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-muted-foreground">{formatted.split(', ').slice(2).join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-right">
                                    <span className="text-2xl font-mono font-semibold tabular-nums">{formatted.split(', ')[1]}</span>
                                    <br/>
                                    <span className="text-sm text-muted-foreground">{formatted.split(', ')[0]}</span>
                                </p>
                                <Button variant="ghost" size="icon" onClick={() => removeTargetTz(tz)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
      </CardContent>
    </Container>
  );
}
