
'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTime } from '@/hooks/use-time';
import { playSound, alarmSounds, type AlarmSound } from '@/lib/sounds';
import { Bell, BellOff, Plus, Trash2, Volume2, AlarmClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { differenceInSeconds, parse } from 'date-fns';
import { RadialProgress } from './RadialProgress';

interface Alarm {
  id: string;
  time: string; // HH:MM
  sound: string; // Sound name
  enabled: boolean;
  name: string;
}

interface AlarmPanelProps {
  fullscreen?: boolean;
  glass?: boolean;
}

const formatCountdown = (seconds: number) => {
    if(seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

export function AlarmPanel({ fullscreen = false, glass = false }: AlarmPanelProps) {
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>('alarms:list', []);
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [newAlarmSound, setNewAlarmSound] = useState<string>(alarmSounds[0].name);
  const [newAlarmName, setNewAlarmName] = useState('Alarm');
  const [notificationPermission, setNotificationPermission] = useState('default');

  const triggeredAlarms = useRef<Set<string>>(new Set());
  const time = useTime();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = () => {
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      toast({ title: 'Notification Permission', description: `Permission ${permission}.` });
    });
  };

  const addAlarm = () => {
    if (newAlarmTime) {
      const newAlarm: Alarm = {
        id: Date.now().toString(),
        time: newAlarmTime,
        sound: newAlarmSound,
        enabled: true,
        name: newAlarmName || 'Alarm',
      };
      setAlarms([...alarms, newAlarm]);
    }
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)));
  };

  const removeAlarm = (id: string) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id));
  };
  
  const getNextAlarm = () => {
    const now = new Date();
    const enabledAlarms = alarms.filter(a => a.enabled);

    if (enabledAlarms.length === 0) return null;

    const sortedAlarms = enabledAlarms
      .map(alarm => {
        const alarmTime = parse(alarm.time, 'HH:mm', new Date());
        let diff = differenceInSeconds(alarmTime, now);
        if (diff < -60) { // allow for a 1-minute grace period before pushing to next day
           alarmTime.setDate(alarmTime.getDate() + 1);
        }
        return { ...alarm, dateTime: alarmTime, diff: differenceInSeconds(alarmTime, now) };
      })
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      
    const upcoming = sortedAlarms.filter(a => a.diff >= 0);
    return upcoming.length > 0 ? upcoming[0] : sortedAlarms[0];
  }

  const nextAlarm = getNextAlarm();
  const countdown = nextAlarm ? differenceInSeconds(nextAlarm.dateTime, time) : 0;
  
  useEffect(() => {
    const currentTime = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    alarms.forEach((alarm) => {
      if (alarm.enabled && alarm.time === currentTime) {
        if (!triggeredAlarms.current.has(alarm.id)) {
          playSound(alarm.sound);
          if (notificationPermission === 'granted') {
            new Notification('Tempusphere Alarm', { body: alarm.name });
          } else {
             toast({ title: 'Alarm!', description: alarm.name });
          }
          triggeredAlarms.current.add(alarm.id);
        }
      } else {
        triggeredAlarms.current.delete(alarm.id);
      }
    });
  }, [time, alarms, notificationPermission, toast]);
  
  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg flex flex-col items-center justify-center p-6' : 'flex flex-col items-center justify-center p-6') : 'flex flex-col h-full';

  if(fullscreen) {
    return (
        <div className={containerClass}>
            {nextAlarm ? (
                <div className="relative flex items-center justify-center">
                  <RadialProgress 
                    progress={100 - (countdown / (24 * 60 * 60)) * 100}
                    className="w-64 h-64 md:w-80 md:h-80"
                  />
                  <div className="absolute text-center">
                      <p className="text-muted-foreground">{nextAlarm.name}</p>
                      <p className="text-5xl md:text-7xl font-bold font-mono tabular-nums">{nextAlarm.time}</p>
                      <p className="text-2xl md:text-3xl font-mono tabular-nums text-primary">{formatCountdown(countdown)}</p>
                  </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                    <AlarmClock className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">No Upcoming Alarms</h3>
                    <p className="text-sm">All alarms are disabled or none are set.</p>
                </div>
            )}
        </div>
    )
  }

  return (
    <Container className={cn('flex flex-col h-full', containerClass)}>
       {!fullscreen && <CardHeader>
        <CardTitle>Alarms</CardTitle>
      </CardHeader>}
      <CardContent className={cn("flex-1 flex flex-col p-4", fullscreen && "pt-4")}>
        {notificationPermission !== 'granted' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Enable notifications for a better experience.</p>
                <Button size="sm" onClick={requestNotificationPermission}>Enable</Button>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 mb-4">
          <Input type="time" value={newAlarmTime} onChange={(e) => setNewAlarmTime(e.target.value)} />
          <Input placeholder="Alarm name" value={newAlarmName} onChange={(e) => setNewAlarmName(e.target.value)} />
          <div className="flex gap-2">
            <Select value={newAlarmSound} onValueChange={(val) => setNewAlarmSound(val)}>
                <SelectTrigger><span className="truncate">{newAlarmSound}</span></SelectTrigger>
                <SelectContent>
                {alarmSounds.map((sound) => (
                    <SelectItem key={sound.name} value={sound.name}>{sound.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => playSound(newAlarmSound)}>
                <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={addAlarm}><Plus className="mr-2 h-4 w-4"/>Add Alarm</Button>
        </div>
        <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-2 pr-4 h-full">
            {alarms.length > 0 ? alarms.map((alarm) => (
                <div key={alarm.id} className={cn("flex justify-between items-center p-3 rounded-lg border", glass ? "bg-black/10 border-white/20" : "bg-background/50", "data-[disabled=true]:opacity-50")} data-disabled={!alarm.enabled}>
                <div>
                    <p className="text-2xl font-mono font-semibold">{alarm.time}</p>
                    <p className="text-sm text-muted-foreground">{alarm.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Switch checked={alarm.enabled} onCheckedChange={() => toggleAlarm(alarm.id)} aria-label="Toggle alarm" />
                    <Button variant="ghost" size="icon" onClick={() => removeAlarm(alarm.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                </div>
            )) : 
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <AlarmClock className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold">No Alarms Set</h3>
              <p className="text-sm">Add an alarm using the form above.</p>
            </div>
            }
            </div>
        </ScrollArea>
      </CardContent>
    </Container>
  );
}
