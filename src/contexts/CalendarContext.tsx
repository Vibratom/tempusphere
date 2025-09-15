
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type EventType = 'Personal' | 'Work';

export interface CalendarEvent {
  id: string; // Unique ID for the calendar event itself
  date: string; // ISO string for the date
  time: string; // HH:MM
  title: string;
  description: string;
  color: string;
  type: EventType;
  sourceId?: string; // Original ID from the source (e.g., project task ID)
}

interface CalendarContextType {
  events: CalendarEvent[];
  setEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (event: CalendarEvent) => void;
  removeEventsBySourceId: (sourceId: string) => void;
  updateEventsBySourceId: (sourceId: string, updates: Partial<CalendarEvent>) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendar:eventsV3', []);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: `evt-${Date.now()}` };
    setEvents(prev => [...prev, newEvent].sort((a,b) => a.time.localeCompare(b.time)));
  };

  const removeEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const removeEventsBySourceId = (sourceId: string) => {
    setEvents(prev => prev.filter(e => e.sourceId !== sourceId));
  }
  
  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e).sort((a,b) => a.time.localeCompare(b.time)));
  }

  const updateEventsBySourceId = (sourceId: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.sourceId === sourceId ? { ...e, ...updates } : e).sort((a,b) => a.time.localeCompare(b.time)));
  }

  const value = {
    events,
    setEvents,
    addEvent,
    removeEvent,
    updateEvent,
    removeEventsBySourceId,
    updateEventsBySourceId
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
