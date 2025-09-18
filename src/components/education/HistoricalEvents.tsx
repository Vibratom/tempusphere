
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, History } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';

interface EventsData {
  date: string;
  data: {
    Events: string[];
  };
}

export function HistoricalEvents() {
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      setEventsData(null);

      try {
        // Switched to a more direct and reliable API endpoint for historical events.
        const response = await fetch('https://byabbe.se/on-this-day/' + (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/events.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // The new API has a different structure. Adapt to it.
        if (data && data.events && data.date) {
            setEventsData({ date: data.date, data: { Events: data.events.map((e: any) => `${e.year}: ${e.description}`) } });
        } else {
            throw new Error("Unexpected API response structure.");
        }
      } catch (e) {
        console.error(e);
        setError('Failed to fetch historical events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">On This Day in History</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl">A look at significant events that occurred on {format(new Date(), 'MMMM d')}.</p>
        </div>

        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-10 w-10"/></div>}
        
        {error && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader><CardTitle>Error</CardTitle></CardHeader>
                <CardContent><p>{error}</p></CardContent>
            </Card>
        )}
        
        {eventsData && (
             <Card>
                <ScrollArea className="h-[70vh]">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Events for {eventsData.date}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-6">
                       <ul className="list-disc pl-5 space-y-2">
                            {eventsData.data.Events.map((event, index) => (
                                <li key={index} className="text-muted-foreground">{event}</li>
                            ))}
                       </ul>
                    </CardContent>
                </ScrollArea>
            </Card>
        )}
    </div>
  );
}
