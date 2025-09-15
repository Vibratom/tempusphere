
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type EventType = string;

export interface CalendarEvent {
  id: string;
  date: string; // ISO string for the date
  time: string; // HH:MM
  title: string;
  description: string;
  color: string;
  type: EventType;
  sourceId?: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  setEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
  eventTypes: EventType[];
  addEventType: (type: EventType) => void;
  removeEventType: (type: EventType) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  removeEvent: (eventId: string) => void;
  updateEvent: (event: CalendarEvent) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendar:eventsV5', []);
  const [eventTypes, setEventTypes] = useLocalStorage<EventType[]>('calendar:eventTypesV2', ['Personal', 'Work']);

  useEffect(() => {
    // Sync any legacy events that might not have a type
    if (events.some(e => !e.type)) {
        setEvents(prev => prev.map(e => e.type ? e : {...e, type: 'Personal' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const addEventType = useCallback((type: EventType) => {
    if (type && !eventTypes.includes(type)) {
      setEventTypes(prev => [...prev, type]);
    }
  }, [eventTypes, setEventTypes]);

  const removeEventType = useCallback((type: EventType) => {
    // Re-assign events of the removed type to 'Personal'
    setEvents(prev => prev.map(e => e.type === type ? { ...e, type: 'Personal' } : e));
    setEventTypes(prev => prev.filter(t => t !== type));
  }, [setEventTypes, setEvents]);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const newEvent = { ...event, id: `evt-${Date.now()}-${Math.random()}` };
    setEvents(prev => [...prev, newEvent].sort((a,b) => a.time.localeCompare(b.time)));
    return newEvent;
  }, [setEvents]);

  const removeEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, [setEvents]);
  
  const updateEvent = useCallback((updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e).sort((a,b) => a.time.localeCompare(b.time)));
  }, [setEvents]);

  const value = {
    events,
    setEvents,
    eventTypes,
    addEventType,
    removeEventType,
    addEvent,
    removeEvent,
    updateEvent,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
