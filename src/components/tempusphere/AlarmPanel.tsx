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
import { Bell, BellOff, Plus, Trash2, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface Alarm {
  id: string;
  time: string; // HH:MM
  sound: AlarmSound;
  enabled: boolean;
  name: string;
}

interface AlarmPanelProps {
  fullscreen?: boolean;
}

export function AlarmPanel({ fullscreen = false }: AlarmPanelProps) {
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>('alarms:list', []);
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [newAlarmSound, setNewAlarmSound] = useState<AlarmSound>('Beep');
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
  const contentClass = fullscreen ? 'bg-transparent' : '';

  return (
    <Container className={cn('flex flex-col h-full', contentClass)}>
       {!fullscreen && <CardHeader>
        <CardTitle>Alarms</CardTitle>
      </CardHeader>}
      <CardContent className={cn("flex-1 flex flex-col", fullscreen && "p-0 pt-4")}>
        {notificationPermission !== 'granted' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Enable notifications for a better experience.</p>
                <Button size="sm" onClick={requestNotificationPermission}>Enable</Button>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          <Input type="time" value={newAlarmTime} onChange={(e) => setNewAlarmTime(e.target.value)} />
          <Input placeholder="Alarm name" value={newAlarmName} onChange={(e) => setNewAlarmName(e.target.value)} />
          <Select value={newAlarmSound} onValueChange={(val) => setNewAlarmSound(val as AlarmSound)}>
            <SelectTrigger><Volume2 className="inline-block mr-2 h-4 w-4"/>{newAlarmSound}</SelectTrigger>
            <SelectContent>
              {alarmSounds.map((sound) => (
                <SelectItem key={sound} value={sound}>{sound}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addAlarm}><Plus className="mr-2 h-4 w-4"/>Add Alarm</Button>
        </div>
        <ScrollArea className="flex-1">
            <div className="space-y-2 pr-4 h-full">
            {alarms.length > 0 ? alarms.map((alarm) => (
                <div key={alarm.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border data-[disabled=true]:opacity-50" data-disabled={!alarm.enabled}>
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
            )) : <div className="flex items-center justify-center h-full"><p className="text-muted-foreground text-center">No alarms set.</p></div>}
            </div>
        </ScrollArea>
      </CardContent>
    </Container>
  );
}
