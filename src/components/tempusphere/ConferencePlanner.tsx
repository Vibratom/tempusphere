
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { timezones } from '@/lib/timezones';
import { Combobox } from '../ui/combobox';
import { Button } from '../ui/button';
import { Loader, Plus, Wand2, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { suggestMeetingTimes, SuggestMeetingTimesOutput } from '@/ai/flows/suggest-meeting-times';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function ConferencePlanner() {
  const [targetTzs, setTargetTzs] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [newTargetTz, setNewTargetTz] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestMeetingTimesOutput | null>(null);
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

  const handleSuggestTimes = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
        const result = await suggestMeetingTimes({ timezones: targetTzs });
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
        <CardTitle>AI Conference Planner</CardTitle>
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
