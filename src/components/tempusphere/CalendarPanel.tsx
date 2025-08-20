
'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { format, parseISO, startOfDay } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CalendarEvent {
  id: string;
  date: string; // ISO string for the date
  title: string;
  color: string;
}

const eventColors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink'];

interface CalendarPanelProps {
    fullscreen?: boolean;
    glass?: boolean;
}

export function CalendarPanel({ fullscreen = false, glass = false }: CalendarPanelProps) {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendar:events', []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState(eventColors[0]);

  const addEvent = () => {
    if (newEventTitle && selectedDate) {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        date: startOfDay(selectedDate).toISOString(),
        title: newEventTitle,
        color: newEventColor,
      };
      setEvents([...events, newEvent]);
      setNewEventTitle('');
    }
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const eventsByDay = events.reduce((acc, event) => {
    const day = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const selectedDayEvents = selectedDate ? eventsByDay[format(selectedDate, 'yyyy-MM-dd')] || [] : [];
  
  const dayWithEventsModifier = Object.keys(eventsByDay).map(dateStr => parseISO(dateStr));
  
  const EventDots = ({date}: {date: Date}) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDay[dayKey];
    if(!dayEvents) return null;
    
    return (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1">
            {dayEvents.slice(0, 3).map(event => (
                <div key={event.id} className={cn('h-1.5 w-1.5 rounded-full')} style={{backgroundColor: event.color}}></div>
            ))}
        </div>
    )
  }

  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg flex items-center justify-center p-4' : 'flex items-center justify-center p-4') : '';

  const calendarComponent = (
     <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className={cn("rounded-md border", fullscreen && 'shadow-lg')}
        modifiers={{ withEvents: dayWithEventsModifier }}
        components={{
            DayContent: (props) => (
                <div className="relative w-full h-full">
                    <p>{props.date.getDate()}</p>
                    <EventDots date={props.date}/>
                </div>
            ),
        }}
        modifiersClassNames={{
            withEvents: 'has-events'
        }}
    />
  )

  if (fullscreen) {
    return (
        <Container className={cn('h-full flex flex-col', containerClass)}>
            {calendarComponent}
        </Container>
    )
  }

  return (
    <Container className={cn('h-full flex flex-col', containerClass)}>
      <CardHeader>
        <CardTitle>Personal Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        <div className="flex justify-center">
            {calendarComponent}
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="p-4 border rounded-lg space-y-3">
             <h4 className="font-semibold text-lg">
              {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
            </h4>
            <div className="flex gap-2 items-center">
                <Input 
                    placeholder="New event title..." 
                    value={newEventTitle} 
                    onChange={e => setNewEventTitle(e.target.value)}
                    disabled={!selectedDate}
                />
                <Select value={newEventColor} onValueChange={setNewEventColor}>
                    <SelectTrigger className="w-[120px]">
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full" style={{backgroundColor: newEventColor}}></div>
                           <span>{newEventColor.charAt(0).toUpperCase() + newEventColor.slice(1)}</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {eventColors.map(color => (
                            <SelectItem key={color} value={color}>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: color}}></div>
                                    <span>{color.charAt(0).toUpperCase() + color.slice(1)}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={addEvent} disabled={!newEventTitle || !selectedDate}><Plus className="mr-2 h-4 w-4"/>Add</Button>
            </div>
          </div>
          <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-2 pr-4">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-3 rounded-lg border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: event.color}}></div>
                        <p className="font-medium">{event.title}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground pt-8">
                  <p>No events for this day.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Container>
  );
}
