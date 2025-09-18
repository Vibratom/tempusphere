
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Calendar, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { format, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarPicker } from '../ui/calendar';

interface ApodData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY';

export function ApodViewer() {
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchApod = async () => {
      setIsLoading(true);
      setError(null);
      setApodData(null);

      const dateString = format(selectedDate, 'yyyy-MM-dd');

      try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${dateString}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApodData = await response.json();
        setApodData(data);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch data from NASA. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApod();
  }, [selectedDate]);
  
  const MediaDisplay = () => {
    if (!apodData) return null;

    if (apodData.media_type === 'video') {
      return (
        <div className="aspect-video w-full">
            <iframe
                src={apodData.url}
                title={apodData.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
            ></iframe>
        </div>
      );
    }
    
    return (
        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden border">
            <Image 
                src={apodData.url} 
                alt={apodData.title} 
                layout="fill" 
                objectFit="contain"
                unoptimized
            />
            {apodData.hdurl && (
                <Button asChild size="sm" className="absolute bottom-2 right-2 opacity-80 hover:opacity-100">
                    <a href={apodData.hdurl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2"/>View HD</a>
                </Button>
            )}
        </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Astronomy Picture of the Day</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Discover the cosmos! Each day a different image or photograph of our fascinating universe is featured, along with a brief explanation written by a professional astronomer.</p>
        </div>

        <div className="flex justify-center mb-8">
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-64">
                        <Calendar className="mr-2"/>
                        {format(selectedDate, 'PPP')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => d && setSelectedDate(d)}
                        disabled={{ after: new Date() }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>

        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-10 w-10"/></div>}
        
        {error && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader><CardTitle>Error</CardTitle></CardHeader>
                <CardContent><p>{error}</p></CardContent>
            </Card>
        )}
        
        {apodData && (
             <Card>
                <ScrollArea className="h-[70vh]">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{apodData.title}</CardTitle>
                        <CardDescription>
                            {format(new Date(apodData.date), 'MMMM d, yyyy')}
                            {apodData.copyright && ` - © ${apodData.copyright}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-6 pb-6">
                       <MediaDisplay />
                       <div className="prose dark:prose-invert max-w-none">
                            <p>{apodData.explanation}</p>
                       </div>
                    </CardContent>
                </ScrollArea>
            </Card>
        )}
        {NASA_API_KEY === 'DEMO_KEY' && (
             <p className="text-xs text-muted-foreground text-center mt-4">
                Using NASA's demo API key. For better performance and higher rate limits, get your own free API key from <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" className="underline">api.nasa.gov</a> and add it as a `NEXT_PUBLIC_NASA_API_KEY` environment variable.
            </p>
        )}
    </div>
  );
}
