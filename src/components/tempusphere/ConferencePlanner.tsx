
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { timezones } from '@/lib/timezones';
import { Combobox } from '../ui/combobox';
import { Button } from '../ui/button';
import { Loader, Plus, Wand2, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// Define the structure for a suggestion
interface Suggestion {
  times: Record<string, string>; // e.g., { 'America/New_York': '10:00 (Today)', 'Europe/London': '15:00 (Today)' }
  isIdeal: boolean;
  score: number;
}

// Define the output structure, mirroring the old AI output for consistency
interface SuggestionOutput {
  summary: string;
  suggestions: Suggestion[];
}

const BUSINESS_HOURS_START = 8; // 8 AM
const BUSINESS_HOURS_END = 18; // 6 PM

// The core logic for finding meeting times
function findMeetingTimes(timezones: string[]): SuggestionOutput {
  const suggestions: Suggestion[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start from the beginning of the day

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Iterate through each hour of the next 48 hours to find slots
  for (let i = 0; i < 48; i++) {
    const baseDate = new Date(today.getTime() + i * 60 * 60 * 1000);

    const times: Record<string, string> = {};
    let score = 0;
    let idealCount = 0;

    timezones.forEach(tz => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });

      const parts = formatter.formatToParts(baseDate);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      
      const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' });
      const localDate = new Date(baseDate.toLocaleString('en-US', { timeZone: tz }));
      
      let dayRelation = 'Today';
      const todayInTz = new Date(new Date().toLocaleString('en-US', {timeZone: tz}));

      if (localDate.getDate() > todayInTz.getDate()) {
        dayRelation = 'Tomorrow';
      } else if (localDate.getDate() < todayInTz.getDate()) {
        dayRelation = 'Yesterday';
      }
      
      times[tz] = `${String(hour).padStart(2, '0')}:00 (${dayRelation})`;

      // Scoring logic
      if (hour >= BUSINESS_HOURS_START && hour < BUSINESS_HOURS_END) {
        score += 2; // High score for business hours
        idealCount++;
      } else if (hour >= 7 && hour < 22) {
        score += 1; // Lower score for reasonable hours
      }
    });

    // Only add suggestions if at least one person is in reasonable hours
    if (score > timezones.length / 2) {
      suggestions.push({
        times,
        isIdeal: idealCount === timezones.length,
        score,
      });
    }
  }

  // Deduplicate and sort suggestions
  const uniqueSuggestions = suggestions.reduce((acc, current) => {
    const timeKey = Object.values(current.times).join('-');
    const existing = acc.find(s => Object.values(s.times).join('-') === timeKey);
    if (!existing || current.score > existing.score) {
        acc = acc.filter(s => Object.values(s.times).join('-') !== timeKey);
        acc.push(current);
    }
    return acc;
  }, [] as Suggestion[]);
  
  uniqueSuggestions.sort((a, b) => b.score - a.score);
  
  const topSuggestions = uniqueSuggestions.slice(0, 5);

  return {
    summary: 'Here are the best times we found based on an 8am-6pm workday.',
    suggestions: topSuggestions,
  };
}


export function ConferencePlanner() {
  const [targetTzs, setTargetTzs] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [newTargetTz, setNewTargetTz] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addTargetTz = () => {
    if (newTargetTz && !targetTzs.includes(newTargetTz)) {
      setTargetTzs([...targetTzs, newTargetTz]);
      setNewTargetTz('');
    }
  };

  const removeTargetTz = (tz: string) => {
    setTargetTzs(targetTzs.filter(t => t !== tz));
  };
  
  const availableTargetTzs = timezones.filter(tz => !targetTzs.includes(tz)).map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }));

  const handleSuggestTimes = () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
        const result = findMeetingTimes(targetTzs);
        setSuggestions(result);
    } catch (err) {
        setError('Could not get suggestions. Please try again.');
        console.error(err);
    }
    setIsLoading(false);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Conference Planner</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="p-4 border rounded-lg space-y-2">
            <h4 className="font-semibold">Meeting Timezones</h4>
            <div className="flex gap-2">
                <Combobox options={availableTargetTzs} value={newTargetTz} onChange={setNewTargetTz} placeholder="Add timezone..." />
                <Button onClick={addTargetTz} disabled={!newTargetTz}><Plus className="mr-2 h-4 w-4" />Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {targetTzs.map(tz => (
                    <div key={tz} className="flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
                        <span>{tz.replace(/_/g, ' ')}</span>
                        <button onClick={() => removeTargetTz(tz)} className="rounded-full hover:bg-background"><X className="h-4 w-4" /></button>
                    </div>
                ))}
            </div>
        </div>

        <Button onClick={handleSuggestTimes} disabled={isLoading || targetTzs.length < 2}>
            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Suggest Good Meeting Times
        </Button>
        
        <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-2 pr-4">
                {error && <p className="text-destructive">{error}</p>}
                {suggestions && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">{suggestions.summary}</p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Option</TableHead>
                                    {targetTzs.map(tz => (
                                        <TableHead key={tz}>{tz.split('/').pop()?.replace(/_/g, ' ')}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suggestions.suggestions.map((suggestion, index) => (
                                    <TableRow key={index} className={suggestion.isIdeal ? 'bg-green-100/50 dark:bg-green-900/20' : ''}>
                                        <TableCell className="font-medium">
                                            Suggestion {index + 1}
                                            {suggestion.isIdeal && <span className="text-xs text-green-600 dark:text-green-400 ml-2">(Ideal)</span>}
                                        </TableCell>
                                         {targetTzs.map(tz => (
                                            <TableCell key={tz}>{suggestion.times[tz] || 'N/A'}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
