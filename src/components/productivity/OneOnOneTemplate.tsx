
'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function OneOnOneTemplate() {
    const [manager, setManager] = useLocalStorage('1on1:manager', '');
    const [employee, setEmployee] = useLocalStorage('1on1:employee', '');
    const [date, setDate] = useLocalStorage('1on1:date', new Date().toISOString().split('T')[0]);
    
    const [checkIn, setCheckIn] = useLocalStorage('1on1:checkIn', '');
    const [priorities, setPriorities] = useLocalStorage('1on1:priorities', '');
    const [challenges, setChallenges] = useLocalStorage('1on1:challenges', '');
    const [growth, setGrowth] = useLocalStorage('1on1:growth', '');
    const [feedback, setFeedback] = useLocalStorage('1on1:feedback', '');

    const sections = [
        { title: "Check-in & How are you doing?", value: checkIn, setter: setCheckIn, placeholder: "Personal updates, general well-being..." },
        { title: "Review of Priorities & Goals", value: priorities, setter: setPriorities, placeholder: "Progress on current tasks, alignment with team goals..." },
        { title: "Challenges & Blockers", value: challenges, setter: setChallenges, placeholder: "Any obstacles? Where do you need help?" },
        { title: "Career Growth & Development", value: growth, setter: setGrowth, placeholder: "Aspirations, learning opportunities, skill development..." },
        { title: "Feedback (Both Ways)", value: feedback, setter: setFeedback, placeholder: "Feedback for the manager, feedback for the employee..." },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl text-center">One-on-One Meeting</CardTitle>
                    <CardDescription className="text-center">A private meeting between a manager and a direct report.</CardDescription>
                </CardHeader>
                 <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Manager</Label>
                        <Input value={manager} onChange={e => setManager(e.target.value)} placeholder="Manager's Name" />
                    </div>
                     <div className="space-y-2">
                        <Label>Employee</Label>
                        <Input value={employee} onChange={e => setEmployee(e.target.value)} placeholder="Employee's Name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {sections.map(section => (
                    <div key={section.title}>
                        <Label className="text-lg font-semibold">{section.title}</Label>
                        <Textarea 
                            value={section.value}
                            onChange={(e) => section.setter(e.target.value)}
                            placeholder={section.placeholder}
                            rows={5}
                            className="mt-2"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
