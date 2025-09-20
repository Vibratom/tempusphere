'use client';

import React, { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Plus, Trash2, Undo, Redo } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---
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

interface BoardMeetingState {
    headerTitle: string;
    description: string;
    meetingTitle: string;
    attendees: Attendee[];
    votes: Vote[];
    approvalText: string;
    actionItems: ListItem[];
    presentations: ListItem[];
    reports: ListItem[];
    votingMotion: string;
    discussionItems: ListItem[];
    sections: {
        attendees: boolean;
        approval: boolean;
        actionItems: boolean;
        voting: boolean;
        presentations: boolean;
        reports: boolean;
        discussion: boolean;
    }
}

// --- Initial State and Helpers ---
const createNewListItem = (text = ''): ListItem => ({ id: uuidv4(), text });
const createNewAttendee = (): Attendee => ({ id: uuidv4(), name: '', title: '', role: '', attendee: true, proxy: '' });
const createNewVote = (): Vote => ({ id: uuidv4(), name: '', voted: true });

const initialBoardMeetingState: BoardMeetingState = {
    headerTitle: 'CORPORATE MEETING MINUTES',
    description: 'A formal record of a board of directors meeting.',
    meetingTitle: 'Technovation Inc. Board of Directors Meeting',
    attendees: [
        { id: '1', name: 'John Smith', title: 'Chair', role: 'Chairperson of the Board', attendee: true, proxy: '' },
        { id: '2', name: 'Jane Doe', title: 'Secretary', role: 'Board Secretary', attendee: true, proxy: '' },
        { id: '3', name: 'David Lee', title: 'Board Member', role: 'Board Member', attendee: true, proxy: '' },
    ],
    votes: [
        { id: '1', name: 'Jane Doe', voted: true },
        { id: '2', name: 'David Lee', voted: true },
        { id: '3', name: 'John Smith', voted: true },
    ],
    approvalText: 'The minutes from the April board meeting were reviewed and approved unanimously.',
    actionItems: [
        createNewListItem('The Marketing Director will finalize social media content for the new fitness tracker launch, targeting athletes and fitness enthusiasts. (Deadline: May 20th)'),
        createNewListItem('The Sales Department will develop a pre-order campaign offering a discount on the new fitness tracker. (Deadline: May 15th)'),
    ],
    presentations: [createNewListItem("The Marketing Director presented a detailed overview of the upcoming launch strategy for Technovation's new fitness tracker.")],
    reports: [createNewListItem("The CFO presented a financial report showing healthy profits and increased investment interest.")],
    votingMotion: "A motion was made by John Smith to approve the overall marketing budget for the new fitness tracker launch.",
    discussionItems: [createNewListItem("NEW FITNESS TRACKER LAUNCH STRATEGY\n- The board discussed the marketing plan for the upcoming launch of their new fitness tracker.\n- John Smith suggested focusing social media marketing on athletes and fitness enthusiasts. (Agreed)\n- David Lee proposed offering a pre-order discount to generate early interest. (Agreed)")],
    sections: {
        attendees: true,
        approval: true,
        actionItems: true,
        voting: true,
        presentations: true,
        reports: true,
        discussion: true,
    }
};

// --- Undo/Redo Hook ---
const useUndoRedo = (initialState: BoardMeetingState) => {
    const [state, setState] = useLocalStorage<BoardMeetingState>('board-meeting:state-v2', initialState);
    const [history, setHistory] = useState<BoardMeetingState[]>([state]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const updateState = (newState: BoardMeetingState, fromHistory = false) => {
        setState(newState);
        if (!fromHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, newState]);
            setHistoryIndex(newHistory.length);
        }
    };
    
    const undo = useCallback(() => {
        if (canUndo) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            updateState(history[newIndex], true);
        }
    }, [canUndo, history, historyIndex]);

    const redo = useCallback(() => {
        if (canRedo) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            updateState(history[newIndex], true);
        }
    }, [canRedo, history, historyIndex]);

    return { state, setState: updateState, undo, redo, canUndo, canRedo };
};

export function BoardMeetingTemplate() {
    const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo(initialBoardMeetingState);
    const { headerTitle, description, meetingTitle, attendees, votes, approvalText, actionItems, presentations, reports, votingMotion, discussionItems, sections } = state;

    // --- Generic Handlers for Dynamic Lists ---
    const handleItemChange = (field: keyof BoardMeetingState, id: string, newText: string) => {
        setState({
            ...state,
            [field]: (state[field] as ListItem[]).map(item => item.id === id ? { ...item, text: newText } : item)
        });
    };

    const addItem = (field: keyof BoardMeetingState) => {
        setState({
            ...state,
            [field]: [...(state[field] as ListItem[]), createNewListItem()]
        });
    };

    const removeItem = (field: keyof BoardMeetingState, id: string) => {
        setState({
            ...state,
            [field]: (state[field] as ListItem[]).filter(item => item.id !== id)
        });
    };

    const handleFieldChange = (field: keyof BoardMeetingState, value: string) => {
        setState({ ...state, [field]: value });
    };

    // --- Attendee Handlers ---
    const handleAttendeeChange = (id: string, field: keyof Attendee, value: string | boolean) => {
        setState({ ...state, attendees: attendees.map(a => a.id === id ? { ...a, [field]: value } : a) });
    };
    const addAttendee = () => setState({ ...state, attendees: [...attendees, createNewAttendee()] });
    const removeAttendee = (id: string) => setState({ ...state, attendees: attendees.filter(a => a.id !== id) });

    // --- Vote Handlers ---
    const handleVoteChange = (id: string, field: 'name' | 'voted', value: string | boolean) => {
        setState({ ...state, votes: votes.map(v => v.id === id ? { ...v, [field]: value } : v) });
    };
    const addVote = () => setState({ ...state, votes: [...votes, createNewVote()] });
    const removeVote = (id: string) => setState({ ...state, votes: votes.filter(v => v.id !== id) });

    // --- Section Visibility Handler ---
    const toggleSectionVisibility = (section: keyof BoardMeetingState['sections']) => {
        setState({ ...state, sections: { ...state.sections, [section]: !state.sections[section] } });
    }

    return (
        <div className="bg-white dark:bg-card p-8 rounded-lg shadow-lg font-sans text-gray-800 dark:text-gray-200">
             <div className="mb-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}><Undo className="mr-2 h-4 w-4"/>Undo</Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}><Redo className="mr-2 h-4 w-4"/>Redo</Button>
            </div>
            {/* Header Section */}
            <header className="mb-8 text-center">
                 <Input 
                    value={headerTitle}
                    onChange={(e) => handleFieldChange('headerTitle', e.target.value)}
                    className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-center"
                 />
                 <Input 
                    value={description}
                    onChange={e => handleFieldChange('description', e.target.value)}
                    className="text-muted-foreground text-center border-none focus-visible:ring-0 h-auto p-0"
                    placeholder="Meeting description..."
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 text-left">
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
                 <div className="mt-4 flex items-center gap-2 bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-md text-left">
                    <Label className="font-semibold text-sm shrink-0">MEETING TITLE:</Label>
                    <Input value={meetingTitle} onChange={e => handleFieldChange('meetingTitle', e.target.value)} className="bg-transparent border-none focus-visible:ring-0 text-sm" />
                </div>
            </header>

            {/* Attendees Section */}
            {sections.attendees && <section className="mb-8">
                <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-purple-300 dark:border-purple-700">
                    <h2 className="text-xl font-bold">MEETING ATTENDEES</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={addAttendee}><Plus className="mr-2 h-4 w-4"/>Add Attendee</Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleSectionVisibility('attendees')}><Trash2 className="h-4 w-4"/></Button>
                    </div>
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
            </section>}
            
            {/* Approval of Minutes */}
            {sections.approval && <section className="mb-8">
                <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-purple-300 dark:border-purple-700">
                    <h2 className="text-xl font-bold">APPROVAL OF PREVIOUS MINUTES</h2>
                    <Button variant="ghost" size="icon" onClick={() => toggleSectionVisibility('approval')}><Trash2 className="h-4 w-4"/></Button>
                </div>
                <Textarea value={approvalText} onChange={e => handleFieldChange('approvalText', e.target.value)} className="bg-transparent" />
            </section>}

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {sections.actionItems && <section>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">ACTION ITEMS</h3>
                            <div className="flex items-center gap-2">
                               <Button variant="ghost" size="icon" onClick={() => addItem('actionItems')}><Plus className="h-4 w-4"/></Button>
                               <Button variant="ghost" size="icon" onClick={() => toggleSectionVisibility('actionItems')}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </div>
                        <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                          {actionItems.map(item => (
                              <div key={item.id} className="flex gap-2">
                                  <Textarea value={item.text} onChange={e => handleItemChange('actionItems', item.id, e.target.value)} rows={2} className="flex-1" />
                                  <Button variant="ghost" size="icon" onClick={() => removeItem('actionItems', item.id)}><Trash2 className="h-4 w-4"/></Button>
                              </div>
                          ))}
                        </div>
                    </section>}
                    {sections.voting && <section>
                         <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                             <h3 className="text-lg font-bold">VOTING</h3>
                            <Button variant="ghost" size="icon" onClick={() => toggleSectionVisibility('voting')}><Trash2 className="h-4 w-4"/></Button>
                         </div>
                         <div className="p-4 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 space-y-3">
                            <p className="font-semibold">MOTION</p>
                             <Textarea value={votingMotion} onChange={e => handleFieldChange('votingMotion', e.target.value)} rows={3} className="bg-white dark:bg-background" />
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
                    </section>}
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                     {sections.presentations && <section>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">PRESENTATIONS</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => addItem('presentations')}><Plus className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => toggleSectionVisibility('presentations')}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </div>
                        <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                             {presentations.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <Textarea value={item.text} onChange={e => handleItemChange('presentations', item.id, e.target.value)} rows={3} className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem('presentations', item.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </section>}
                    {sections.reports && <section>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">REPORTS</h3>
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => addItem('reports')}><Plus className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => toggleSectionVisibility('reports')}><Trash2 className="h-4 w-4"/></Button>
                             </div>
                        </div>
                        <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                           {reports.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <Textarea value={item.text} onChange={e => handleItemChange('reports', item.id, e.target.value)} rows={3} className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem('reports', item.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </section>}
                    {sections.discussion && <section>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">
                            <h3 className="text-lg font-bold">DISCUSSION ITEMS</h3>
                            <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" onClick={() => addItem('discussionItems')}><Plus className="h-4 w-4"/></Button>
                             <Button variant="ghost" size="icon" onClick={() => toggleSectionVisibility('discussion')}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </div>
                         <div className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0 p-2 space-y-2">
                             {discussionItems.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <Textarea value={item.text} onChange={e => handleItemChange('discussionItems', item.id, e.target.value)} rows={4} className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem('discussionItems', item.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </section>}
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
    const [state] = useLocalStorage<BoardMeetingState>('board-meeting:state-v2', initialBoardMeetingState);
    const { headerTitle, description, meetingTitle, attendees, votes, approvalText, actionItems, presentations, reports, votingMotion, discussionItems, sections } = state;

    return (
        <div className="bg-white dark:bg-card p-8 rounded-lg shadow-lg font-sans text-gray-800 dark:text-gray-200">
            {/* Header Section */}
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{headerTitle}</h1>
                <p className="text-muted-foreground">{description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 text-left">
                    <div><p className="font-semibold">DATE AND TIME</p><p>May 6, 2024, 10:00 AM - 12:00 PM</p></div>
                    <div><p className="font-semibold">LOCATION</p><p>Technovation Inc. Headquarters</p></div>
                    <div><p className="font-semibold">DURATION</p><p>2 Hours</p></div>
                    <div><p className="font-semibold">ADJOURNMENT</p><p>12:00 PM</p></div>
                </div>
                <div className="mt-4 p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-md text-left">
                    <span className="font-semibold text-sm shrink-0">MEETING TITLE:</span> {meetingTitle}
                </div>
            </header>

            {/* Attendees Section */}
            {sections.attendees && <section className="mb-8">
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
            </section>}
            
            {/* Approval of Minutes */}
            {sections.approval && <section className="mb-8">
                <h2 className="text-xl font-bold mb-2 pb-2 border-b-2 border-purple-300 dark:border-purple-700">APPROVAL OF PREVIOUS MINUTES</h2>
                <p className="whitespace-pre-wrap">{approvalText}</p>
            </section>}

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {sections.actionItems && <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">ACTION ITEMS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{actionItems.map(item => <li key={item.id}>{item.text}</li>)}</ul></div></section>}
                    {sections.voting && <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">VOTING</h3><div className="p-4 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md space-y-2"><p className="font-semibold">MOTION</p><p>{votingMotion}</p><p className="font-semibold pt-2">VOTES</p><ul className="list-disc pl-5">{votes.map(vote => <li key={vote.id}>{vote.name}: {vote.voted ? 'Voted' : 'Did not vote'}</li>)}</ul></div></section>}
                </div>
                <div className="space-y-8">
                    {sections.presentations && <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">PRESENTATIONS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{presentations.map(item => <li key={item.id}>{item.text}</li>)}</ul></div></section>}
                    {sections.reports && <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">REPORTS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{reports.map(item => <li key={item.id}>{item.text}</li>)}</ul></div></section>}
                    {sections.discussion && <section><h3 className="text-lg font-bold p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">DISCUSSION ITEMS</h3><div className="p-2 bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md"><ul className="list-disc pl-5 space-y-1">{discussionItems.map(item => <li key={item.id} className="whitespace-pre-wrap">{item.text}</li>)}</ul></div></section>}
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

    