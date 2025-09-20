
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface ListItem {
  id: string;
  text: string;
}

interface RoleItem {
    id: string;
    role: string;
    name: string;
}

const createNewListItem = (text = ''): ListItem => ({ id: uuidv4(), text });
const createNewRoleItem = (role = '', name = ''): RoleItem => ({ id: uuidv4(), role, name });

export function ProjectKickoffTemplate() {
    const [headerTitle, setHeaderTitle] = useLocalStorage('kickoff:header-title', 'Project Kick-off Meeting');
    const [title, setTitle] = useLocalStorage('kickoff:title', 'New SuperWidget Launch');
    const [date, setDate] = useLocalStorage('kickoff:date', new Date().toISOString().split('T')[0]);
    const [goals, setGoals] = useLocalStorage<ListItem[]>('kickoff:goals', [createNewListItem('Launch the SuperWidget by end of Q4.')]);
    const [inScope, setInScope] = useLocalStorage<ListItem[]>('kickoff:inScope', [createNewListItem('Core product features for v1.')]);
    const [outOfScope, setOutOfScope] = useLocalStorage<ListItem[]>('kickoff:outOfScope', [createNewListItem('Mobile application integration (v2).')]);
    const [milestones, setMilestones] = useLocalStorage<ListItem[]>('kickoff:milestones', [createNewListItem('Design complete - June 30')]);
    const [roles, setRoles] = useLocalStorage<RoleItem[]>('kickoff:roles', [createNewRoleItem('Project Manager', 'Alice')]);
    const [risks, setRisks] = useLocalStorage<ListItem[]>('kickoff:risks', [createNewListItem('Supply chain delays.')]);
    const [questions, setQuestions] = useLocalStorage<ListItem[]>('kickoff:questions', [createNewListItem('What is the marketing budget?')]);

    // Generic list handlers
    const handleListChange = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>, id: string, newText: string) => {
        setter(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
    };
    const addListItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => setter(prev => [...prev, createNewListItem()]);
    const removeListItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>, id: string) => setter(prev => prev.filter(item => item.id !== id));
    
    // Role specific handlers
    const handleRoleChange = (id: string, field: 'role' | 'name', value: string) => {
        setRoles(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };
    const addRoleItem = () => setRoles(prev => [...prev, createNewRoleItem()]);
    const removeRoleItem = (id: string) => setRoles(prev => prev.filter(item => item.id !== id));

    const renderListSection = (
        title: string, 
        items: ListItem[], 
        setter: React.Dispatch<React.SetStateAction<ListItem[]>>,
        placeholder: string
    ) => (
        <Card>
            <CardHeader className="flex-row items-center justify-between py-3">
                <CardTitle className="text-lg">{title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => addListItem(setter)}><Plus className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="flex gap-2">
                        <Input value={item.text} onChange={e => handleListChange(setter, item.id, e.target.value)} placeholder={placeholder} />
                        <Button variant="ghost" size="icon" onClick={() => removeListItem(setter, item.id)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Input
                        value={headerTitle}
                        onChange={e => setHeaderTitle(e.target.value)}
                        className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0"
                    />
                </CardHeader>
                 <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Project Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-semibold" />
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {renderListSection("Project Goals & Objectives", goals, setGoals, "e.g., Achieve 10k active users...")}

            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">Scope & Deliverables</AccordionTrigger>
                    <AccordionContent className="grid md:grid-cols-2 gap-4">
                        {renderListSection("In Scope", inScope, setInScope, "e.g., User authentication")}
                        {renderListSection("Out of Scope", outOfScope, setOutOfScope, "e.g., Admin dashboard")}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            {renderListSection("Timeline & Key Milestones", milestones, setMilestones, "e.g., Phase 1 complete - Q3")}
            
            <Card>
                <CardHeader className="flex-row items-center justify-between py-3">
                    <CardTitle className="text-lg">Roles & Responsibilities</CardTitle>
                    <Button variant="ghost" size="icon" onClick={addRoleItem}><Plus className="h-4 w-4"/></Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {roles.map(item => (
                        <div key={item.id} className="grid grid-cols-10 gap-2 items-center">
                            <Input value={item.role} onChange={e => handleRoleChange(item.id, 'role', e.target.value)} placeholder="Role (e.g., Developer)" className="col-span-4" />
                            <Input value={item.name} onChange={e => handleRoleChange(item.id, 'name', e.target.value)} placeholder="Name" className="col-span-5" />
                            <div className="col-span-1 text-right">
                                <Button variant="ghost" size="icon" onClick={() => removeRoleItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {renderListSection("Risks & Assumptions", risks, setRisks, "Potential risk...")}
            {renderListSection("Open Questions", questions, setQuestions, "Question for the team...")}
        </div>
    );
}

const ReadOnlyListSection = ({ title, items }: { title: string, items: ListItem[]}) => (
    <Card>
        <CardHeader className="py-3"><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
        <CardContent><ul className="list-disc pl-5 space-y-1">{items.map(item => <li key={item.id}>{item.text}</li>)}</ul></CardContent>
    </Card>
);

export function ProjectKickoffPreview() {
    const [headerTitle] = useLocalStorage('kickoff:header-title', 'Project Kick-off Meeting');
    const [title] = useLocalStorage('kickoff:title', '');
    const [date] = useLocalStorage('kickoff:date', '');
    const [goals] = useLocalStorage<ListItem[]>('kickoff:goals', []);
    const [inScope] = useLocalStorage<ListItem[]>('kickoff:inScope', []);
    const [outOfScope] = useLocalStorage<ListItem[]>('kickoff:outOfScope', []);
    const [milestones] = useLocalStorage<ListItem[]>('kickoff:milestones', []);
    const [roles] = useLocalStorage<RoleItem[]>('kickoff:roles', []);
    const [risks] = useLocalStorage<ListItem[]>('kickoff:risks', []);
    const [questions] = useLocalStorage<ListItem[]>('kickoff:questions', []);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-2xl text-center">{headerTitle}</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div><Label>Project Title</Label><p className="text-lg font-semibold">{title}</p></div>
                    <div><Label>Date</Label><p>{date}</p></div>
                </CardContent>
            </Card>

            <ReadOnlyListSection title="Project Goals & Objectives" items={goals} />

            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">Scope & Deliverables</AccordionTrigger>
                    <AccordionContent className="grid md:grid-cols-2 gap-4">
                        <ReadOnlyListSection title="In Scope" items={inScope} />
                        <ReadOnlyListSection title="Out of Scope" items={outOfScope} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <ReadOnlyListSection title="Timeline & Key Milestones" items={milestones} />
            
            <Card>
                <CardHeader className="py-3"><CardTitle className="text-lg">Roles & Responsibilities</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-1">{roles.map(item => <li key={item.id}><strong>{item.role}:</strong> {item.name}</li>)}</ul>
                </CardContent>
            </Card>

            <ReadOnlyListSection title="Risks & Assumptions" items={risks} />
            <ReadOnlyListSection title="Open Questions" items={questions} />
        </div>
    );
}

    