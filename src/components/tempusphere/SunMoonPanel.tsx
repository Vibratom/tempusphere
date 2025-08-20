
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Sunrise, Sunset, Moon, Sparkles, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SunMoonData {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
}

interface SunMoonPanelProps {
  fullscreen?: boolean;
  glass?: boolean;
}

export function SunMoonPanel({ fullscreen = false, glass = false }: SunMoonPanelProps) {
  const [data, setData] = useLocalStorage<Partial<SunMoonData>>('sunMoon:data', {
    sunrise: '06:00',
    sunset: '18:00',
    moonrise: '19:00',
    moonset: '07:00',
    moonPhase: 'Full Moon',
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({
        title: 'Saved!',
        description: 'Your Sun & Moon data has been updated.',
    });
  };
  
  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg' : 'bg-transparent') : '';

  const renderContent = () => {
    if (isEditing) {
        return (
            <div className="p-6 space-y-4">
                 <div className="text-center text-muted-foreground text-sm">
                    <p>Enter your local astronomical data. You can find this on most weather websites.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Sunrise Time</label>
                        <Input type="time" value={data.sunrise} onChange={e => setData(d => ({...d, sunrise: e.target.value}))}/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Sunset Time</label>
                        <Input type="time" value={data.sunset} onChange={e => setData(d => ({...d, sunset: e.target.value}))}/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Moonrise Time</label>
                        <Input type="time" value={data.moonrise} onChange={e => setData(d => ({...d, moonrise: e.target.value}))}/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Moonset Time</label>
                        <Input type="time" value={data.moonset} onChange={e => setData(d => ({...d, moonset: e.target.value}))}/>
                    </div>
                     <div className="col-span-2">
                        <label className="text-sm font-medium">Moon Phase</label>
                        <Input value={data.moonPhase} onChange={e => setData(d => ({...d, moonPhase: e.target.value}))} placeholder="e.g. Waxing Crescent"/>
                    </div>
                </div>
                <Button onClick={handleSave} className="w-full"><Save className="mr-2"/>Save Data</Button>
            </div>
        )
    }
      
    if (data.sunrise) {
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
             <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">Edit Data</Button>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Sparkles className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Track Sun & Moon</h3>
          <p className="mb-4">Enter your local sunrise, sunset, and moon data to display it here.</p>
          <Button onClick={() => setIsEditing(true)}>
            Enter Data
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
