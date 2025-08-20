
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sunrise, Sunset, Moon, Sparkles, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getAstronomicalData } from '@/ai/flows/astronomical-data';
import type { AstronomicalDataOutput } from '@/ai/types';


interface SunMoonPanelProps {
  fullscreen?: boolean;
  glass?: boolean;
}

export function SunMoonPanel({ fullscreen = false, glass = false }: SunMoonPanelProps) {
  const [data, setData] = useState<Partial<AstronomicalDataOutput> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSunMoonData = () => {
    setIsLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await getAstronomicalData({ latitude, longitude });
          if(result.sunrise === 'Error') {
             throw new Error("Could not fetch data from API.");
          }
          setData(result);
        } catch (err) {
          setError('Could not fetch astronomical data.');
          console.error(err);
          toast({
            title: 'Error',
            description: 'Failed to fetch Sun & Moon data.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError('Unable to retrieve your location. Please enable location services.');
        setIsLoading(false);
        toast({
            title: 'Location Error',
            description: 'Please enable location services to use this feature.',
            variant: 'destructive',
        })
      }
    );
  };
  
  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg' : 'bg-transparent') : '';

  const renderContent = () => {
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Loader className="w-16 h-16 mb-4 animate-spin"/>
                <h3 className="text-xl font-semibold">Fetching Your Sky...</h3>
                <p>Please allow location access when prompted.</p>
            </div>
        )
    }

    if (error) {
         return (
             <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
                <h3 className="text-xl font-semibold mb-2">An Error Occurred</h3>
                <p className="mb-4">{error}</p>
                <Button onClick={fetchSunMoonData}>Try Again</Button>
            </div>
        )
    }
      
    if (data && data.sunrise) {
      return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={cn("p-4 rounded-lg flex items-center gap-4 border", glass ? 'bg-black/10 border-white/20' : 'bg-background/50')}>
                    <Sunrise className="w-10 h-10 text-yellow-500"/>
                    <div>
                        <p className="text-muted-foreground">Sunrise</p>
                        <p className="text-2xl font-bold">{data.sunrise}</p>
                    </div>
                </div>
                <div className={cn("p-4 rounded-lg flex items-center gap-4 border", glass ? 'bg-black/10 border-white/20' : 'bg-background/50')}>
                    <Sunset className="w-10 h-10 text-orange-500"/>
                    <div>
                        <p className="text-muted-foreground">Sunset</p>
                        <p className="text-2xl font-bold">{data.sunset}</p>
                    </div>
                </div>
                 {/* Moon data is not available from this API, so it's hidden for now */}
            </div>
             <Button onClick={fetchSunMoonData} variant="outline" className="w-full">Refresh Data</Button>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Sparkles className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Track Sun & Moon</h3>
          <p className="mb-4">Get your local sunrise and sunset times automatically.</p>
          <Button onClick={fetchSunMoonData}>
            Get My Local Data
          </Button>
        </div>
      );
  };

  return (
    <Container className={cn('h-full flex flex-col', containerClass)}>
      {!fullscreen && (
        <CardHeader>
          <CardTitle>Sun & Moon</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 flex flex-col p-0">
        {renderContent()}
      </CardContent>
    </Container>
  );
}
