
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

interface ListItem {
    id: string;
    text: string;
}

const createNewListItem = (text = ''): ListItem => ({ id: uuidv4(), text });
const createNewAttendee = (): Attendee => ({ id: uuidv4(), name: '', title: '', role: '', attendee: true, proxy: '' });
const createNewVote = (): Vote => ({ id: uuidv4(), name: '', voted: true });


export function BoardMeetingTemplate() {
    const [headerTitle, setHeaderTitle] = useLocalStorage('board-meeting:header-title', 'CORPORATE MEETING MINUTES');
    const [meetingTitle, setMeetingTitle] = useLocalStorage('board-meeting:title', 'Technovation Inc. Board of Directors Meeting');
    const [attendees, setAttendees] = useLocalStorage<Attendee[]>('board-meeting:attendees', [
        { id: '1', name: 'John Smith', title: 'Chair', role: 'Chairperson of the Board', attendee: true, proxy: '' },
        { id: '2', name: 'Jane Doe', title: 'Secretary', role: 'Board Secretary', attendee: true, proxy: '' },
        { id: '3', name: 'David Lee', title: 'Board Member', role: 'Board Member', attendee: true, proxy: '' },
    ]);
    const [votes, setVotes] = useLocalStorage<Vote[]>('board-meeting:votes', [
        { id: '1', name: 'Jane Doe', voted: true },
        { id: '2', name: 'David Lee', voted: true },
        { id: '3', name: 'John Smith', voted: true },
    ]);
    
    // --- Dynamic Content Sections ---
    const [approvalText, setApprovalText] = useLocalStorage('board-meeting:approval', 'The minutes from the April board meeting were reviewed and approved unanimously.');
    const [actionItems, setActionItems] = useLocalStorage<ListItem[]>('board-meeting:action-items', [
        createNewListItem('The Marketing Director will finalize social media content for the new fitness tracker launch, targeting athletes and fitness enthusiasts. (Deadline: May 20th)'),
        createNewListItem('The Sales Department will develop a pre-order campaign offering a discount on the new fitness tracker. (Deadline: May 15th)'),
    ]);
    const [presentations, setPresentations] = useLocalStorage<ListItem[]>('board-meeting:presentations', [
        createNewListItem("The Marketing Director presented a detailed overview of the upcoming launch strategy for Technovation's new fitness tracker.")
    ]);
    const [reports, setReports] = useLocalStorage<ListItem[]>('board-meeting:reports', [
        createNewListItem("The CFO presented a financial report showing healthy profits and increased investment interest.")
    ]);
    const [votingMotion, setVotingMotion] = useLocalStorage('board-meeting:voting-motion', "A motion was made by John Smith to approve the overall marketing budget for the new fitness tracker launch.");
    const [discussionItems, setDiscussionItems] = useLocalStorage<ListItem[]>('board-meeting:discussion-items', [
        createNewListItem("NEW FITNESS TRACKER LAUNCH STRATEGY\n- The board discussed the marketing plan for the upcoming launch of their new fitness tracker.\n- John Smith suggested focusing social media marketing on athletes and fitness enthusiasts. (Agreed)\n- David Lee proposed offering a pre-order discount to generate early interest. (Agreed)"),
    ]);

    // --- Generic Handlers for Dynamic Lists ---
    const handleItemChange = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>, id: string, newText: string) => {
        setter(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
    };

    const addItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => {
        setter(prev => [...prev, createNewListItem()]);
    };

    const removeItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>, id: string) => {
        setter(prev => prev.filter(item => item.id !== id));
    };
    
    // --- Attendee Handlers ---
    const handleAttendeeChange = (id: string, field: keyof Attendee, value: string | boolean) => {
        setAttendees(attendees.map(a => a.id === id ? { ...a, [field]: value } : a));
    };
    const addAttendee = () => setAttendees(prev => [...prev, createNewAttendee()]);
    const removeAttendee = (id: string) => setAttendees(prev => prev.filter(a => a.id !== id));

    // --- Vote Handlers ---
    const handleVoteChange = (id: string, field: 'name' | 'voted', value: string | boolean) => {
        setVotes(votes.map(v => v.id === id ? { ...v, [field]: value } : v));
    };
    const addVote = () => setVotes(prev => [...prev, createNewVote()]);
    const removeVote = (id: string) => setVotes(prev => prev.filter(v => v.id !== id));

    return (
        <div className="bg-white dark:bg-card p-8 rounded-lg shadow-lg font-sans text-gray-800 dark:text-gray-200">
            {/* Header Section */}
            <header className="mb-8">
                 <Input 
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                 />
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
                <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-purple-300 dark:border-purple-700">
                    <h2 className="text-xl font-bold">MEETING ATTENDEES</h2>
                    <Button variant="outline" size="sm" onClick={addAttendee}><Plus className="mr-2 h-4 w-4"/>Add Attendee</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-purple-100/50 dark:bg-purple-900/30">
                            <tr>
                                {['Name', 'Title', 'Role', 'Attendee', 'Proxy For', ''].map(h => <th key={h} className="p-2 font-semibold">{h}</th>)}
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
                                    <td className="p-2"><Button variant="ghost" size="icon" onClick={() => removeAttendee(attendee.id)}><Trash2 className="h-4 w-4"/></Button></td>
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
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">ACTION ITEMS</h3>
                            <Button variant="ghost" size="icon" onClick={() => addItem(setActionItems)}><Plus className="h-4 w-4"/></Button>
                        </div>
                        <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                          {actionItems.map(item => (
                              <div key={item.id} className="flex gap-2">
                                  <Textarea value={item.text} onChange={e => handleItemChange(setActionItems, item.id, e.target.value)} rows={2} className="flex-1" />
                                  <Button variant="ghost" size="icon" onClick={() => removeItem(setActionItems, item.id)}><Trash2 className="h-4 w-4"/></Button>
                              </div>
                          ))}
                        </div>
                    </section>
                    <section>
                         <h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">VOTING</h3>
                         <div className="p-4 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 space-y-3">
                            <p className="font-semibold">MOTION</p>
                             <Textarea value={votingMotion} onChange={e => setVotingMotion(e.target.value)} rows={3} className="bg-white dark:bg-background" />
                             <div className="flex justify-between items-center pt-2">
                                <p className="font-semibold">THE MEMBERS VOTED ON THE MOTION.</p>
                                <Button variant="ghost" size="sm" onClick={addVote}><Plus className="mr-2 h-4 w-4"/>Add Voter</Button>
                             </div>
                             <div className="space-y-2">
                                {votes.map(vote => (
                                    <div key={vote.id} className="flex items-center justify-between gap-2">
                                        <Input value={vote.name} onChange={e => handleVoteChange(vote.id, 'name', e.target.value)} className="flex-1" />
                                        <Checkbox checked={vote.voted} onCheckedChange={v => handleVoteChange(vote.id, 'voted', v as boolean)} />
                                        <Button variant="ghost" size="icon" onClick={() => removeVote(vote.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                             </div>
                         </div>
                    </section>
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                     <section>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">PRESENTATIONS</h3>
                             <Button variant="ghost" size="icon" onClick={() => addItem(setPresentations)}><Plus className="h-4 w-4"/></Button>
                        </div>
                        <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                             {presentations.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <Textarea value={item.text} onChange={e => handleItemChange(setPresentations, item.id, e.target.value)} rows={3} className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(setPresentations, item.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">REPORTS</h3>
                             <Button variant="ghost" size="icon" onClick={() => addItem(setReports)}><Plus className="h-4 w-4"/></Button>
                        </div>
                        <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                           {reports.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <Textarea value={item.text} onChange={e => handleItemChange(setReports, item.id, e.target.value)} rows={3} className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(setReports, item.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">DISCUSSION ITEMS</h3>
                             <Button variant="ghost" size="icon" onClick={() => addItem(setDiscussionItems)}><Plus className="h-4 w-4"/></Button>
                        </div>
                         <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                             {discussionItems.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <Textarea value={item.text} onChange={e => handleItemChange(setDiscussionItems, item.id, e.target.value)} rows={4} className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(setDiscussionItems, item.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
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


export function BoardMeetingPreview() {
    const [headerTitle] = useLocalStorage('board-meeting:header-title', 'CORPORATE MEETING MINUTES');
    const [meetingTitle] = useLocalStorage('board-meeting:title', 'Technovation Inc. Board of Directors Meeting');
    const [attendees] = useLocalStorage<Attendee[]>('board-meeting:attendees', []);
    const [votes] = useLocalStorage<Vote[]>('board-meeting:votes', []);
    const [approvalText] = useLocalStorage('board-meeting:approval', '');
    const [actionItems] = useLocalStorage<ListItem[]>('board-meeting:action-items', []);
    const [presentations] = useLocalStorage<ListItem[]>('board-meeting:presentations', []);
    const [reports] = useLocalStorage<ListItem[]>('board-meeting:reports', []);
    const [votingMotion] = useLocalStorage('board-meeting:voting-motion', "");
    const [discussionItems] = useLocalStorage<ListItem[]>('board-meeting:discussion-items', []);

    return (
        <div className="bg-white dark:bg-card p-8 rounded-lg shadow-lg font-sans text-gray-800 dark:text-gray-200">
            {/* Header Section */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{headerTitle}</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="font-semibold">DATE AND TIME</p><p>May 6, 2024, 10:00 AM - 12:00 PM</p></div>
                    <div><p className="font-semibold">LOCATION</p><p>Technovation Inc. Headquarters</p></div>
                    <div><p className="font-semibold">DURATION</p><p>2 Hours</p></div>
                    <div><p className="font-semibold">ADJOURNMENT</p><p>12:00 PM</p></div>
                </div>
                <div className="mt-4 p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-md">
                    <span className="font-semibold text-sm shrink-0">MEETING TITLE:</span> {meetingTitle}
                </div>
            </header>

            {/* Attendees Section */}
            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 pb-2 border-b-2 border-purple-300 dark:border-purple-700">MEETING ATTENDEES</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-purple-100/50 dark:bg-purple-900/30">
                            <tr>{['Name', 'Title', 'Role', 'Attendee', 'Proxy For'].map(h => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {attendees.map(attendee => (
                                <tr key={attendee.id} className="border-b dark:border-gray-700">
                                    <td className="p-2">{attendee.name}</td>
                                    <td className="p-2">{attendee.title}</td>
                                    <td className="p-2">{attendee.role}</td>
                                    <td className="p-2">{attendee.attendee ? '✔️' : '❌'}</td>
                                    <td className="p-2">{attendee.proxy || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            {/* Approval of Minutes */}
            <section className="mb-8">
                <h2 className="text-xl font-bold mb-2 pb-2 border-b-2 border-purple-300 dark:border-purple-700">APPROVAL OF PREVIOUS MINUTES</h2>
                <p className="whitespace-pre-wrap">{approvalText}</p>
            </section>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">ACTION ITEMS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{actionItems.map(item => <li key={item.id}>{item.text}</li>)}</ul></div></section>
                    <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">VOTING</h3><div className="p-4 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md space-y-2"><p className="font-semibold">MOTION</p><p>{votingMotion}</p><p className="font-semibold pt-2">VOTES</p><ul className="list-disc pl-5">{votes.map(vote => <li key={vote.id}>{vote.name}: {vote.voted ? 'Voted' : 'Did not vote'}</li>)}</ul></div></section>
                </div>
                <div className="space-y-8">
                    <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">PRESENTATIONS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{presentations.map(item => <li key={item.id}>{item.text}</li>)}</ul></div></section>
                    <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">REPORTS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{reports.map(item => <li key={item.id}>{item.text}</li>)}</ul></div></section>
                    <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">DISCUSSION ITEMS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{discussionItems.map(item => <li key={item.id}>{item.text}</li>)}</ul></div></section>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="mt-8 pt-4 border-t-2 border-purple-300 dark:border-purple-700 flex justify-between items-center">
                <p className="font-bold">NEXT MEETING DATE</p>
                <p>JUNE 3RD</p>
            </footer>
        </div>
    );
}

    