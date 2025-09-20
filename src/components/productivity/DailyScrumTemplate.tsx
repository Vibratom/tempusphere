
'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MemberUpdate {
  id: string;
  name: string;
  yesterday: string;
  today: string;
  blockers: string;
}

const createNewMemberUpdate = (name = ''): MemberUpdate => ({
  id: uuidv4(),
  name,
  yesterday: '',
  today: '',
  blockers: '',
});

export function DailyScrumTemplate() {
    const [date, setDate] = useLocalStorage('scrum:date', new Date().toISOString().split('T')[0]);
    const [updates, setUpdates] = useLocalStorage<MemberUpdate[]>('scrum:updates', [createNewMemberUpdate('Team Member 1')]);

    const handleUpdateChange = (id: string, field: keyof MemberUpdate, value: string) => {
        setUpdates(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addMember = () => {
        setUpdates(prev => [...prev, createNewMemberUpdate(`Team Member ${prev.length + 1}`)]);
    };
    
    const removeMember = (id: string) => {
        setUpdates(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Daily Stand-up / Scrum</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="max-w-xs mx-auto">
                        <Label>Meeting Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            
            <div className="space-y-4">
                {updates.map((update, index) => (
                    <Card key={update.id}>
                        <CardHeader className="flex-row items-center justify-between py-3 bg-muted/50">
                             <Input 
                                value={update.name} 
                                onChange={(e) => handleUpdateChange(update.id, 'name', e.target.value)} 
                                placeholder="Team Member Name" 
                                className="text-lg font-semibold border-none bg-transparent focus-visible:ring-0"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeMember(update.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-green-600 dark:text-green-400">What did you do yesterday?</Label>
                                <Textarea value={update.yesterday} onChange={e => handleUpdateChange(update.id, 'yesterday', e.target.value)} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-blue-600 dark:text-blue-400">What will you do today?</Label>
                                <Textarea value={update.today} onChange={e => handleUpdateChange(update.id, 'today', e.target.value)} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-600 dark:text-red-400">Any blockers?</Label>
                                <Textarea value={update.blockers} onChange={e => handleUpdateChange(update.id, 'blockers', e.target.value)} rows={3} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center">
                <Button variant="outline" onClick={addMember}><Plus className="mr-2 h-4 w-4"/>Add Team Member</Button>
            </div>
        </div>
    );
}
