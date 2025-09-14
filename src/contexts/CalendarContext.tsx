
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface CalendarEvent {
  id: string;
  date: string; // ISO string for the date
  time: string; // HH:MM
  title: string;
  description: string;
  color: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  setEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (event: CalendarEvent) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendar:eventsV2', []);

  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event].sort((a,b) => a.time.localeCompare(b.time)));
  };

  const removeEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };
  
  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  }

  const value = {
    events,
    setEvents,
    addEvent,
    removeEvent,
    updateEvent
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

    