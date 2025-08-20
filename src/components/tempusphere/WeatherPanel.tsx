
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudFog, CloudRain, CloudSun, Cloudy, Loader, Snowflake, Sun, Thermometer, Umbrella, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getWeatherData } from '@/ai/flows/weather-data';
import type { WeatherDataOutput } from '@/ai/types';


interface WeatherPanelProps {
  fullscreen?: boolean;
  glass?: boolean;
}

const weatherIcons: Record<WeatherDataOutput['weatherCondition'], React.ElementType> = {
    'Sunny': Sun,
    'Partly Cloudy': CloudSun,
    'Cloudy': Cloud,
    'Rainy': CloudRain,
    'Stormy': Umbrella,
    'Snowy': Snowflake,
    'Foggy': CloudFog,
    'Windy': Wind
}

export function WeatherPanel({ fullscreen = false, glass = false }: WeatherPanelProps) {
  const [data, setData] = useState<Partial<WeatherDataOutput> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWeatherData = () => {
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
          const result = await getWeatherData({ latitude, longitude });
          setData(result);
        } catch (err) {
          setError('Could not fetch weather data.');
          console.error(err);
          toast({
            title: 'Error',
            description: 'Failed to fetch weather data.',
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
                <h3 className="text-xl font-semibold">Fetching Weather...</h3>
                <p>Please allow location access when prompted.</p>
            </div>
        )
    }

    if (error) {
         return (
             <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
                <h3 className="text-xl font-semibold mb-2">An Error Occurred</h3>
                <p className="mb-4">{error}</p>
                <Button onClick={fetchWeatherData}>Try Again</Button>
            </div>
        )
    }
      
    if (data && data.weatherCondition) {
      const Icon = weatherIcons[data.weatherCondition] || Cloud;
      return (
        <div className="p-6 flex flex-col items-center justify-center text-center h-full">
            <Icon className="w-24 h-24 mb-4 text-yellow-400"/>
            <p className="text-6xl font-bold">{data.temperature}°C</p>
            <p className="text-xl text-muted-foreground">{data.weatherCondition}</p>
            
            <div className="flex justify-center gap-6 mt-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5"/>
                    <span>{data.windSpeed} km/h</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5"/>
                    <span>{data.humidity}%</span>
                </div>
            </div>

            <p className="mt-6 text-sm text-center">{data.forecast}</p>

            <Button onClick={fetchWeatherData} variant="outline" className="mt-6">Refresh Data</Button>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Cloudy className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Live Weather & Climate</h3>
          <p className="mb-4">Get your local weather conditions and forecast automatically.</p>
          <Button onClick={fetchWeatherData}>
            Get My Local Weather
          </Button>
        </div>
      );
  };

  return (
    <Container className={cn('h-full flex flex-col', containerClass)}>
      {!fullscreen && (
        <CardHeader>
          <CardTitle>Weather & Climate</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 flex flex-col p-0">
        {renderContent()}
      </CardContent>
    </Container>
  );
}
