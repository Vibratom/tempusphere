
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { format, parseISO, startOfDay } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '../ui/textarea';
import { useCalendar, CalendarEvent, EventType } from '@/contexts/CalendarContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DayProps } from 'react-day-picker';

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
  const [activeTab, setActiveTab] = useState<EventType | 'All'>('All');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddEvent = () => {
    if (newEventTitle && selectedDate) {
      addEvent({
        date: startOfDay(selectedDate).toISOString(),
        time: newEventTime,
        title: newEventTitle,
        description: newEventDescription,
        color: newEventColor,
        type: 'Personal'
      });
      setNewEventTitle('');
      setNewEventTime('12:00');
      setNewEventDescription('');
    }
  };

  const eventsByDay = useMemo(() => events.reduce((acc, event) => {
    const day = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>), [events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dayKey = format(selectedDate, 'yyyy-MM-dd');
    const dayEvents = eventsByDay[dayKey] || [];
    if(activeTab === 'All') return dayEvents.sort((a, b) => a.time.localeCompare(b.time));
    return dayEvents.filter(e => e.type === activeTab).sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, eventsByDay, activeTab]);
  
  const dayWithEventsModifier = Object.keys(eventsByDay).map(dateStr => parseISO(dateStr));
  
  const EventDots = ({date}: {date: Date}) => {
    if (!isClient) return null; // Prevent rendering on server
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
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg' : '') : '';

  const calendarComponent = (
     <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className={cn("rounded-md border", fullscreen && 'shadow-lg', glass && 'bg-black/10 border-white/20')}
        modifiers={{ withEvents: dayWithEventsModifier }}
        components={{
            Day: ({ date, displayMonth, ...props }: DayProps) => {
                const dayContent = (
                    <div className="relative h-full w-full flex items-center justify-center">
                        <p>{date.getDate()}</p>
                        <EventDots date={date}/>
                    </div>
                );
                // The Day component from react-day-picker needs a button as its root element for accessibility and functionality.
                // We're wrapping our custom content inside the structure react-day-picker expects.
                return (
                    <button
                        {...props}
                        // We must spread the props to pass down things like aria-label, disabled state, etc.
                        // We remove the children from props to replace it with our custom dayContent
                        // and also remove style if it exists to avoid conflicts with tailwind classes
                        // @ts-ignore
                        style={{...props.style, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}
                    >
                        {dayContent}
                    </button>
                )
            }
        }}
        modifiersClassNames={{
            withEvents: 'has-events'
        }}
    />
  )

  if (fullscreen) {
    return (
        <Container className={cn('h-full flex flex-col items-center justify-center p-4', containerClass)}>
            {calendarComponent}
        </Container>
    )
  }

  return (
    <Container className={cn('h-full flex flex-col', containerClass)}>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        <div className="flex justify-center">
            {calendarComponent}
        </div>
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Personal">Personal</TabsTrigger>
              <TabsTrigger value="Work">Work</TabsTrigger>
            </TabsList>
            <TabsContent value="All" />
            <TabsContent value="Personal" />
            <TabsContent value="Work" />
          </Tabs>

          {activeTab === 'Personal' && (
            <div className="p-4 border rounded-lg space-y-3 animation-fade-in">
              <h4 className="font-semibold text-lg">
                {selectedDate ? `Add Personal Event for ${format(selectedDate, 'PPP')}` : 'Select a date'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                  <Input placeholder="Event title..." value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} disabled={!selectedDate} />
                  <Input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} disabled={!selectedDate} />
                  <Textarea placeholder="Description (optional)..." value={newEventDescription} onChange={e => setNewEventDescription(e.target.value)} disabled={!selectedDate} className="md:col-span-2" rows={2} />
                  <div className='flex gap-2'>
                      <Select value={newEventColor} onValueChange={setNewEventColor}>
                          <SelectTrigger className="w-full"><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{backgroundColor: newEventColor}}></div><span>{newEventColor.charAt(0).toUpperCase() + newEventColor.slice(1)}</span></div></SelectTrigger>
                          <SelectContent>
                              {eventColors.map(color => (<SelectItem key={color} value={color}><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{backgroundColor: color}}></div><span>{color.charAt(0).toUpperCase() + color.slice(1)}</span></div></SelectItem>))}
                          </SelectContent>
                      </Select>
                      <Button onClick={handleAddEvent} disabled={!newEventTitle || !selectedDate} className="w-full"><Plus className="mr-2 h-4 w-4"/>Add</Button>
                  </div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-2 pr-4">
              {isClient && selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-start p-3 rounded-lg border bg-background/50">
                    <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5" style={{backgroundColor: event.color}}></div>
                        <div>
                          <p className="font-semibold">{event.title} <span className="text-xs text-muted-foreground">({event.type})</span></p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-sm font-mono text-muted-foreground">{event.time}</p>
                      {event.type === 'Personal' && (
                        <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
