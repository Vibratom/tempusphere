
'use client';

import { useState } from 'react';
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
import { Textarea } from '../ui/textarea';
import { useCalendar, CalendarEvent } from '@/contexts/CalendarContext';

const eventColors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink'];

interface CalendarPanelProps {
    fullscreen?: boolean;
    glass?: boolean;
}

export function CalendarPanel({ fullscreen = false, glass = false }: CalendarPanelProps) {
  const { events, addEvent, removeEvent } = useCalendar();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventColor, setNewEventColor] = useState(eventColors[0]);

  const handleAddEvent = () => {
    if (newEventTitle && selectedDate) {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        date: startOfDay(selectedDate).toISOString(),
        time: newEventTime,
        title: newEventTitle,
        description: newEventDescription,
        color: newEventColor,
      };
      addEvent(newEvent);
      setNewEventTitle('');
      setNewEventTime('12:00');
      setNewEventDescription('');
    }
  };

  const eventsByDay = events.reduce((acc, event) => {
    const day = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const selectedDayEvents = selectedDate ? (eventsByDay[format(selectedDate, 'yyyy-MM-dd')] || []) : [];
  
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
              {selectedDate ? `Add Event for ${format(selectedDate, 'PPP')}` : 'Select a date'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                <Input 
                    placeholder="Event title..." 
                    value={newEventTitle} 
                    onChange={e => setNewEventTitle(e.target.value)}
                    disabled={!selectedDate}
                />
                 <Input 
                    type="time"
                    value={newEventTime} 
                    onChange={e => setNewEventTime(e.target.value)}
                    disabled={!selectedDate}
                />
                <Textarea 
                    placeholder="Description (optional)..."
                    value={newEventDescription}
                    onChange={e => setNewEventDescription(e.target.value)}
                    disabled={!selectedDate}
                    className="md:col-span-2"
                    rows={2}
                />
                <div className='flex gap-2'>
                    <Select value={newEventColor} onValueChange={setNewEventColor}>
                        <SelectTrigger className="w-full">
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
                    <Button onClick={handleAddEvent} disabled={!newEventTitle || !selectedDate} className="w-full"><Plus className="mr-2 h-4 w-4"/>Add</Button>
                </div>
            </div>
          </div>
          <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-2 pr-4">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-start p-3 rounded-lg border bg-background/50">
                    <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5" style={{backgroundColor: event.color}}></div>
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-sm font-mono text-muted-foreground">{event.time}</p>
                      <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
