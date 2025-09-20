
'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '../ui/input';
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

const initialAttendees: Attendee[] = [
    { id: '1', name: 'Sarah Jones', title: 'Chair', role: 'Board President', attendee: true, proxy: '' },
    { id: '2', name: 'Mr. Davis', title: 'Secretary', role: 'Board Secretary', attendee: false, proxy: '' },
    { id: '3', name: 'Ms. Lee', title: '-', role: 'Board Member', attendee: true, proxy: '' },
];


export function AnnualMeetingTemplate() {
    const [meetingTitle, setMeetingTitle] = useLocalStorage('annual-meeting:title', 'Happy Pets Animal Shelter Annual Meeting');
    const [attendees, setAttendees] = useLocalStorage<Attendee[]>('annual-meeting:attendees', initialAttendees);
    
    // Using simple state for text areas as they are less structured than the tables
    const [callToAction, setCallToAction] = useLocalStorage('annual-meeting:callToAction', 'The meeting was called to order by Chair Sarah Jones at 10:00 AM.');
    const [welcome, setWelcome] = useLocalStorage('annual-meeting:welcome', 'Sarah Jones welcomed everyone and introduced Dr. Miller, a local veterinarian who volunteered to speak about the importance of pet wellness.');
    const [approval, setApproval] = useLocalStorage('annual-meeting:approval', 'The minutes from the previous annual meeting were reviewed and approved unanimously.');
    const [elections, setElections] = useLocalStorage('annual-meeting:elections', 'Nominations were opened for two vacant board member positions. Two qualified candidates were nominated and elected by a majority vote.');
    const [proposals, setProposals] = useLocalStorage('annual-meeting:proposals', 'A proposal was presented to allocate additional funds towards a new cat playroom in the shelter. The proposal was discussed and approved by a majority vote.');
    const [openForum, setOpenForum] = useLocalStorage('annual-meeting:openForum', 'Members expressed their appreciation for the shelter\'s work and asked questions about upcoming adoption events.');
    const [reports, setReports] = useLocalStorage('annual-meeting:reports', "PRESIDENT'S REPORT\nSarah Jones presented a summary of Happy Pets' achievements in the past year, including the number of animals adopted, volunteer contributions, and community outreach initiatives.\n\nFINANCIAL REPORT\nDavid Lee presented the financial report, highlighting a healthy balance sheet and increased donations from the community.\n\nGUEST SPEAKER\nDr. Miller provided a brief presentation on common pet health concerns and the importance of preventative care for animals.");

    const handleAttendeeChange = (id: string, field: keyof Attendee, value: string | boolean) => {
        setAttendees(attendees.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    return (
        <div className="bg-white dark:bg-card p-8 rounded-lg shadow-lg font-sans text-gray-800 dark:text-gray-200">
            {/* Header Section */}
            <header className="mb-8 text-center md:text-left">
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">Annual Meeting</h1>
                <h2 className="text-5xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">Minutes</h2>
            </header>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                 <div className="flex items-center gap-2 bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-md">
                    <Label className="font-semibold text-sm shrink-0 uppercase">Meeting Title:</Label>
                    <Input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} className="bg-transparent border-none focus-visible:ring-0 text-sm" />
                </div>
                <div className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
                    <div className="font-semibold uppercase">Date and Time</div>
                    <div className="bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-md"><Input defaultValue="May 6, 2024" className="bg-transparent border-none h-auto p-0" /> <Input defaultValue="10:00 AM - 12:00 PM" className="bg-transparent border-none h-auto p-0" /></div>
                    <div className="font-semibold uppercase">Location</div>
                    <div className="bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-md"><Input defaultValue="Happy Pets Animal Shelter Community Room" className="bg-transparent border-none h-auto p-0" /></div>
                    <div className="font-semibold uppercase">Duration</div>
                    <div className="bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-md"><Input defaultValue="2 Hours" className="bg-transparent border-none h-auto p-0" /></div>
                    <div className="font-semibold uppercase">Adjournment</div>
                    <div className="bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-md"><Input defaultValue="12:00 PM" className="bg-transparent border-none h-auto p-0" /></div>
                </div>
            </div>

            {/* Attendees Section */}
            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 pb-2 uppercase tracking-wider">Meeting Attendees</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-purple-100/50 dark:bg-purple-900/30">
                            <tr>
                                {['Name', 'Title', 'Role', 'Attendee', 'Proxy For'].map(h => <th key={h} className="p-2 font-semibold uppercase">{h}</th>)}
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
            
            <section className="mb-8 border-t-2 border-purple-300 dark:border-purple-700 pt-4">
                 <h2 className="text-xl font-bold mb-2 pb-2 uppercase tracking-wider">Call to Order</h2>
                 <Textarea value={callToAction} onChange={e => setCallToAction(e.target.value)} className="bg-transparent text-base" />
            </section>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                     <section>
                        <h3 className="text-lg font-bold uppercase tracking-wider p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">Welcome and Introductions</h3>
                        <Textarea value={welcome} onChange={e => setWelcome(e.target.value)} rows={6} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                     <section>
                        <h3 className="text-lg font-bold uppercase tracking-wider p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">Elections</h3>
                        <Textarea value={elections} onChange={e => setElections(e.target.value)} rows={4} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                     <section>
                        <h3 className="text-lg font-bold uppercase tracking-wider p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">Proposals and Voting</h3>
                        <Textarea value={proposals} onChange={e => setProposals(e.target.value)} rows={4} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                     <section>
                        <h3 className="text-lg font-bold uppercase tracking-wider p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">Open Forum</h3>
                        <Textarea value={openForum} onChange={e => setOpenForum(e.target.value)} rows={4} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-bold uppercase tracking-wider p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">Approval of Previous Minutes</h3>
                        <Textarea value={approval} onChange={e => setApproval(e.target.value)} rows={3} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                    <section>
                        <h3 className="text-lg font-bold uppercase tracking-wider p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-t-md">Reports</h3>
                        <Textarea value={reports} onChange={e => setReports(e.target.value)} rows={12} className="bg-purple-100/20 dark:bg-purple-900/10 rounded-b-md border-t-0" />
                    </section>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="mt-8 pt-4 border-t-2 border-purple-300 dark:border-purple-700 flex justify-between items-center">
                <p className="font-bold uppercase">Next Meeting Date</p>
                <Input defaultValue="June 3rd at 6:00 PM at the shelter" className="bg-transparent border-none w-auto text-right" />
            </footer>
        </div>
    );
}

export function AnnualMeetingPreview() {
    const [meetingTitle] = useLocalStorage('annual-meeting:title', '');
    const [attendees] = useLocalStorage<Attendee[]>('annual-meeting:attendees', []);
    const [callToAction] = useLocalStorage('annual-meeting:callToAction', '');
    const [welcome] = useLocalStorage('annual-meeting:welcome', '');
    const [approval] = useLocalStorage('annual-meeting:approval', '');
    const [elections] = useLocalStorage('annual-meeting:elections', '');
    const [proposals] = useLocalStorage('annual-meeting:proposals', '');
    const [openForum] = useLocalStorage('annual-meeting:openForum', '');
    const [reports] = useLocalStorage('annual-meeting:reports', '');

    return (
        <div className="prose dark:prose-invert max-w-none">
            <h2>{meetingTitle}</h2>
            <h3>Attendees</h3>
            <ul>
                {attendees.map(a => <li key={a.id}>{a.name} ({a.role}) - {a.attendee ? 'Present' : 'Absent'}</li>)}
            </ul>
            <h3>Call to Order</h3>
            <p>{callToAction}</p>
            <h3>Welcome and Introductions</h3>
            <p>{welcome}</p>
            <h3>Approval of Previous Minutes</h3>
            <p>{approval}</p>
            <h3>Reports</h3>
            <p>{reports}</p>
            <h3>Elections</h3>
            <p>{elections}</p>
            <h3>Proposals and Voting</h3>
            <p>{proposals}</p>
            <h3>Open Forum</h3>
            <p>{openForum}</p>
        </div>
    );
}
