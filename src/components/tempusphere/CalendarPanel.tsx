
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { format, parseISO, startOfDay } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2, X, Edit, Check } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useProjects } from '@/contexts/ProjectsContext';

const eventColors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink'];

interface CalendarPanelProps {
    fullscreen?: boolean;
    glass?: boolean;
}

const EditEventForm = ({ event, onSave, onCancel }: { event: CalendarEvent, onSave: (event: CalendarEvent) => void, onCancel: () => void }) => {
    const [title, setTitle] = useState(event.title);
    const [time, setTime] = useState(event.time);
    const [description, setDescription] = useState(event.description);

    const handleSave = () => {
        onSave({ ...event, title, time, description });
        onCancel();
    };

    return (
        <div className="p-3 my-2 border rounded-lg bg-background space-y-2 animation-fade-in">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title"/>
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={2}/>
            <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
        </div>
    )
}

export function CalendarPanel({ fullscreen = false, glass = false }: CalendarPanelProps) {
  const { events, addEvent, removeEvent, updateEvent, eventTypes, addEventType, removeEventType } = useCalendar();
  const { addTask, updateTask, removeTask: removeProjectTask, board } = useProjects();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventColor, setNewEventColor] = useState(eventColors[0]);
  const [activeTab, setActiveTab] = useState<EventType | 'All'>('All');
  const [newTabName, setNewTabName] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    if (newEventTitle && selectedDate && activeTab !== 'All') {
      let sourceId: string | undefined = undefined;

      if (activeTab === 'Work') {
        const todoColumn = board.columnOrder[0];
        if (todoColumn) {
          const newTask = addTask(todoColumn, { 
            title: newEventTitle,
            dueDate: startOfDay(selectedDate).toISOString(),
          });
          sourceId = newTask.id;
        }
      }

      addEvent({
        date: startOfDay(selectedDate).toISOString(),
        time: newEventTime,
        title: newEventTitle,
        description: newEventDescription,
        color: activeTab === 'Work' ? 'purple' : newEventColor,
        type: activeTab,
        sourceId: sourceId
      });

      setNewEventTitle('');
      setNewEventTime('12:00');
      setNewEventDescription('');
    }
  }, [newEventTitle, selectedDate, activeTab, addEvent, newEventTime, newEventDescription, newEventColor, board.columnOrder, addTask]);
  
  const handleUpdateEvent = useCallback((updatedEvent: CalendarEvent) => {
    updateEvent(updatedEvent);
    if(updatedEvent.type === 'Work' && updatedEvent.sourceId) {
        const task = board.tasks[updatedEvent.sourceId];
        if (task) {
            updateTask({
                ...task,
                title: updatedEvent.title,
                dueDate: updatedEvent.date,
            });
        }
    }
  }, [updateEvent, board.tasks, updateTask]);

  const handleRemoveEvent = useCallback((eventId: string) => {
    const eventToRemove = events.find(e => e.id === eventId);
    removeEvent(eventId);
    if (eventToRemove?.type === 'Work' && eventToRemove.sourceId) {
        removeProjectTask(eventToRemove.sourceId);
    }
  }, [removeEvent, events, removeProjectTask]);

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
            Day: (props: DayProps) => {
                const { date, displayMonth, ...buttonProps } = props;
                if (!isClient) {
                    return <div className="relative h-full w-full flex items-center justify-center"><p>{date.getDate()}</p></div>;
                }

                const dayContent = (
                    <div className="relative h-full w-full flex items-center justify-center">
                        <p>{date.getDate()}</p>
                        <EventDots date={date}/>
                    </div>
                );

                return (
                    <button {...buttonProps} >
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
              <div className="flex items-center gap-2">
                <TabsList className="grid h-auto p-1" style={{ gridTemplateColumns: `repeat(${eventTypes.length + 1}, auto)` }}>
                  <TabsTrigger value="All">All</TabsTrigger>
                  {eventTypes.map(type => (
                    <TabsTrigger key={type} value={type} className="relative group pr-7">
                        {type}
                        {type !== 'Personal' && type !== 'Work' && (
                            <button onClick={(e) => { e.stopPropagation(); removeEventType(type); }} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100">
                                <X className="h-3 w-3"/>
                            </button>
                        )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="ghost"><Plus className="h-4 w-4"/></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex gap-2">
                            <Input placeholder="New category..." value={newTabName} onChange={e => setNewTabName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (addEventType(newTabName), setNewTabName(''))} />
                            <Button size="icon" onClick={() => {addEventType(newTabName); setNewTabName('')}}><Check className="h-4 w-4"/></Button>
                        </div>
                    </PopoverContent>
                </Popover>
              </div>
            </Tabs>
            
            {activeTab !== 'All' && (
              <div className="p-4 border rounded-lg space-y-3 animation-fade-in">
                <h4 className="font-semibold text-lg">
                  {selectedDate ? `Add ${activeTab} Event for ${format(selectedDate, 'PPP')}` : 'Select a date'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                    <Input placeholder="Event title..." value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} disabled={!selectedDate} />
                    <Input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} disabled={!selectedDate} />
                    <Textarea placeholder="Description (optional)..." value={newEventDescription} onChange={e => setNewEventDescription(e.target.value)} disabled={!selectedDate} className="md:col-span-2" rows={2} />
                    <div className='flex gap-2 items-center'>
                        {activeTab !== 'Work' && (
                          <Select value={newEventColor} onValueChange={setNewEventColor}>
                              <SelectTrigger><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{backgroundColor: newEventColor}}></div><span>{newEventColor.charAt(0).toUpperCase() + newEventColor.slice(1)}</span></div></SelectTrigger>
                              <SelectContent>
                                  {eventColors.map(color => (<SelectItem key={color} value={color}><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{backgroundColor: color}}></div><span>{color.charAt(0).toUpperCase() + color.slice(1)}</span></div></SelectItem>))}
                              </SelectContent>
                          </Select>
                        )}
                        <Button onClick={handleAddEvent} disabled={!newEventTitle || !selectedDate} className="w-full"><Plus className="mr-2 h-4 w-4"/>Add</Button>
                    </div>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 -mr-4">
              <div className="space-y-2 pr-4">
                {isClient && selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    editingEventId === event.id ? (
                      <EditEventForm 
                        key={event.id}
                        event={event} 
                        onSave={handleUpdateEvent}
                        onCancel={() => setEditingEventId(null)}
                      />
                    ) : (
                      <div key={event.id} className="flex justify-between items-start p-3 rounded-lg border bg-background/50 group">
                        <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5" style={{backgroundColor: event.color}}></div>
                            <div>
                              <p className="font-semibold">{event.title} <span className="text-xs text-muted-foreground">({event.type})</span></p>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-mono text-muted-foreground mr-2">{event.time}</p>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingEventId(event.id)}>
                              <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveEvent(event.id)}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  ))
                ) : isClient ? (
                  <div className="text-center text-muted-foreground pt-8">
                    <p>No {activeTab !== 'All' && activeTab} events for this day.</p>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
        </div>
      </CardContent>
    </Container>
  );
}
