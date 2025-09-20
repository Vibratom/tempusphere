
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface Attendee {
    id: string;
    name: string;
    title: string;
    role: string;
    attendee: boolean;
    proxy: string;
}

interface Vote {
    id: string;
    name: string;
    voted: boolean;
}

const initialAttendees: Attendee[] = [
    { id: '1', name: 'John Smith', title: 'Chair', role: 'Chairperson of the Board', attendee: true, proxy: '' },
    { id: '2', name: 'Jane Doe', title: 'Secretary', role: 'Board Secretary', attendee: true, proxy: '' },
    { id: '3', name: 'David Lee', title: 'Board Member', role: 'Board Member', attendee: true, proxy: '' },
];

const initialVotes: Vote[] = [
    { id: '1', name: 'Jane Doe', voted: true },
    { id: '2', name: 'David Lee', voted: true },
    { id: '3', name: 'John Smith', voted: true },
];


export function BoardMeetingTemplate() {
    const [meetingTitle, setMeetingTitle] = useLocalStorage('board-meeting:title', 'Technovation Inc. Board of Directors Meeting');
    const [attendees, setAttendees] = useLocalStorage<Attendee[]>('board-meeting:attendees', initialAttendees);
    const [votes, setVotes] = useLocalStorage<Vote[]>('board-meeting:votes', initialVotes);
    
    // Using simple state for text areas as they are less structured than the tables
    const [approvalText, setApprovalText] = useState('The minutes from the April board meeting were reviewed and approved unanimously.');
    const [actionItems, setActionItems] = useState('- The Marketing Director will finalize social media content for the new fitness tracker launch, targeting athletes and fitness enthusiasts. (Deadline: May 20th)\n- The Sales Department will develop a pre-order campaign offering a discount on the new fitness tracker. (Deadline: May 15th)');
    const [presentations, setPresentations] = useState("The Marketing Director presented a detailed overview of the upcoming launch strategy for Technovation's new fitness tracker.");
    const [reports, setReports] = useState("The CFO presented a financial report showing healthy profits and increased investment interest.");
    const [votingMotion, setVotingMotion] = useState("A motion was made by John Smith to approve the overall marketing budget for the new fitness tracker launch.");
    const [discussionItems, setDiscussionItems] = useState("NEW FITNESS TRACKER LAUNCH STRATEGY\n- The board discussed the marketing plan for the upcoming launch of their new fitness tracker.\n- John Smith suggested focusing social media marketing on athletes and fitness enthusiasts. (Agreed)\n- David Lee proposed offering a pre-order discount to generate early interest. (Agreed)");
    
    const handleAttendeeChange = (id: string, field: keyof Attendee, value: string | boolean) => {
        setAttendees(attendees.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const handleVoteChange = (id: string, voted: boolean) => {
        setVotes(votes.map(v => v.id === id ? { ...v, voted } : v));
    };

    return (
        <div className="bg-white dark:bg-card p-8 rounded-lg shadow-lg font-sans text-gray-800 dark:text-gray-200">
            {/* Header Section */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">CORPORATE MEETING MINUTES</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="font-semibold">DATE AND TIME</p>
                        <Input defaultValue="May 6, 2024" className="bg-purple-100/50 dark:bg-purple-900/30 border-none" />
                        <Input defaultValue="10:00 AM - 12:00 PM" className="bg-purple-100/50 dark:bg-purple-900/30 border-none mt-1" />
                    </div>
                    <div>
                        <p className="font-semibold">LOCATION</p>
                        <Input defaultValue="Technovation Inc. Headquarters" className="bg-purple-100/50 dark:bg-purple-900/30 border-none" />
                    </div>
                    <div>
                        <p className="font-semibold">DURATION</p>
                        <Input defaultValue="2 Hours" className="bg-purple-100/50 dark:bg-purple-900/30 border-none" />
                    </div>
                    <div>
                        <p className="font-semibold">ADJOURNMENT</p>
                        <Input defaultValue="12:00 PM" className="bg-purple-100/50 dark:bg-purple-900/30 border-none" />
                    </div>
                </div>
                 <div className="mt-4 flex items-center gap-2 bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-md">
                    <Label className="font-semibold text-sm shrink-0">MEETING TITLE:</Label>
                    <Input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} className="bg-transparent border-none focus-visible:ring-0 text-sm" />
                </div>
            </header>

            {/* Attendees Section */}
            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 pb-2 border-b-2 border-purple-300 dark:border-purple-700">MEETING ATTENDEES</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-purple-100/50 dark:bg-purple-900/30">
                            <tr>
                                {['Name', 'Title', 'Role', 'Attendee', 'Proxy For'].map(h => <th key={h} className="p-2 font-semibold">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {attendees.map(attendee => (
                                <tr key={attendee.id} className="border-b dark:border-gray-700">
                                    <td className="p-2"><Input value={attendee.name} onChange={e => handleAttendeeChange(attendee.id, 'name', e.target.value)} className="border-none" /></td>
                                    <td className="p-2"><Input value={attendee.title} onChange={e => handleAttendeeChange(attendee.id, 'title', e.target.value)} className="border-none" /></td>
                                    <td className="p-2"><Input value={attendee.role} onChange={e => handleAttendeeChange(attendee.id, 'role', e.target.value)} className="border-none" /></td>
                                    <td className="p-2"><Checkbox checked={attendee.attendee} onCheckedChange={v => handleAttendeeChange(attendee.id, 'attendee', v as boolean)} /></td>
                                    <td className="p-2"><Input value={attendee.proxy} onChange={e => handleAttendeeChange(attendee.id, 'proxy', e.target.value)} className="border-none" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            {/* Approval of Minutes */}
             <section className="mb-8">
                <h2 className="text-xl font-bold mb-2 pb-2 border-b-2 border-purple-300 dark:border-purple-700">APPROVAL OF PREVIOUS MINUTES</h2>
                <Textarea value={approvalText} onChange={e => setApprovalText(e.target.value)} className="bg-transparent" />
            </section>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">ACTION ITEMS</h3>
                        <Textarea value={actionItems} onChange={e => setActionItems(e.target.value)} rows={6} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                    <section>
                         <h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">VOTING</h3>
                         <div className="p-4 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 space-y-3">
                            <p className="font-semibold">MOTION</p>
                             <Textarea value={votingMotion} onChange={e => setVotingMotion(e.target.value)} rows={3} className="bg-white dark:bg-background" />
                             <p className="font-semibold pt-2">THE MEMBERS VOTED ON THE MOTION.</p>
                             <div className="space-y-2">
                                {votes.map(vote => (
                                    <div key={vote.id} className="flex items-center justify-between">
                                        <Label htmlFor={`vote-${vote.id}`}>{vote.name}</Label>
                                        <Checkbox id={`vote-${vote.id}`} checked={vote.voted} onCheckedChange={v => handleVoteChange(vote.id, v as boolean)} />
                                    </div>
                                ))}
                             </div>
                         </div>
                    </section>
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                     <section>
                        <h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">PRESENTATIONS</h3>
                        <Textarea value={presentations} onChange={e => setPresentations(e.target.value)} rows={4} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                    <section>
                        <h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">REPORTS</h3>
                        <Textarea value={reports} onChange={e => setReports(e.target.value)} rows={4} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                    <section>
                        <h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">DISCUSSION ITEMS</h3>
                        <Textarea value={discussionItems} onChange={e => setDiscussionItems(e.target.value)} rows={6} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="mt-8 pt-4 border-t-2 border-purple-300 dark:border-purple-700 flex justify-between items-center">
                <p className="font-bold">NEXT MEETING DATE</p>
                <Input defaultValue="JUNE 3RD" className="bg-purple-100/50 dark:bg-purple-900/30 border-none w-auto text-right" />
            </footer>
        </div>
    );
}
