
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAstronomicalData } from '@/ai/flows/astronomical-data';
import type { AstronomicalDataOutput } from '@/ai/types';
import { Loader, Sunrise, Sunset, Moon, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface SunMoonPanelProps {
  fullscreen?: boolean;
  glass?: boolean;
}

export function SunMoonPanel({ fullscreen = false, glass = false }: SunMoonPanelProps) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [data, setData] = useState<AstronomicalDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        if (result.state === 'granted') {
          requestLocation();
        }
        result.onchange = () => {
          setPermissionStatus(result.state);
          if (result.state === 'granted') {
            requestLocation();
          }
        };
      });
    }
  }, []);

  const requestLocation = () => {
    setIsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (err) => {
        setError(`Could not get location: ${err.message}`);
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    if (location) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await getAstronomicalData(location);
          setData(result);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch astronomical data. Please try again later.');
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [location]);

  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg' : 'bg-transparent') : '';

  const renderContent = () => {
    if (permissionStatus !== 'granted') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Sparkles className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Enable Location Access</h3>
          <p className="mb-4">To show you accurate sunrise and sunset times, we need to know your location.</p>
          <Button onClick={requestLocation} disabled={permissionStatus === 'denied'}>
            {permissionStatus === 'denied' ? 'Permission Denied' : 'Grant Location Access'}
          </Button>
           {permissionStatus === 'denied' && <p className="text-xs mt-2">You need to enable location permission in your browser settings.</p>}
        </div>
      );
    }

    if (isLoading && !data) {
      return (
        <div className="p-6 grid grid-cols-2 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full col-span-2" />
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">An Error Occurred</h3>
          <p>{error}</p>
        </div>
       )
    }

    if (data) {
      return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
             <div className={cn("p-4 rounded-lg flex items-center gap-4 border", glass ? 'bg-black/10 border-white/20' : 'bg-background/50')}>
                <Moon className="w-10 h-10 text-blue-300 -rotate-45"/>
                <div>
                    <p className="text-muted-foreground">Moonrise</p>
                    <p className="text-2xl font-bold">{data.moonrise}</p>
                </div>
            </div>
            <div className={cn("p-4 rounded-lg flex items-center gap-4 border", glass ? 'bg-black/10 border-white/20' : 'bg-background/50')}>
                <Moon className="w-10 h-10 text-blue-500 rotate-45"/>
                <div>
                    <p className="text-muted-foreground">Moonset</p>
                    <p className="text-2xl font-bold">{data.moonset}</p>
                </div>
            </div>
            <div className={cn("p-4 rounded-lg flex items-center justify-center gap-4 border col-span-1 md:col-span-2", glass ? 'bg-black/10 border-white/20' : 'bg-background/50')}>
                <p className="text-muted-foreground">Moon Phase</p>
                <p className="text-xl font-bold">{data.moonPhase}</p>
            </div>
        </div>
      );
    }
    
    return null;
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
