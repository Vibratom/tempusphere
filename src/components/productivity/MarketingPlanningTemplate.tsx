
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface PersonaData {
    description: string;
    problems: string;
    whyBuying: string;
    actionPurchase: string;
    actionEnquire: string;
    actionConnect: string;
    actionDownload: string;
    remarkable: string;
    proof: string;
    whereAreThey: string;
    whoTrust: string;
    contentStrategy: string;
    buyerKeywords: string;
    marketingTactics: string;
    todoWeek: string;
    todoMonth: string;
    todoQuarter: string;
    todoYear: string;
    scorecardPurchasesGoal: string;
    scorecardPurchasesResult: string;
    scorecardEnquiriesGoal: string;
    scorecardEnquiriesResult: string;
    scorecardConnectionsGoal: string;
    scorecardConnectionsResult: string;
    scorecardDownloadsGoal: string;
    scorecardDownloadsResult: string;
}

const createNewPersonaData = (): PersonaData => ({
    description: '', problems: '', whyBuying: '', actionPurchase: '', actionEnquire: '', actionConnect: '', actionDownload: '',
    remarkable: '', proof: '', whereAreThey: '', whoTrust: '', contentStrategy: '', buyerKeywords: '', marketingTactics: '',
    todoWeek: '', todoMonth: '', todoQuarter: '', todoYear: '',
    scorecardPurchasesGoal: '', scorecardPurchasesResult: '', scorecardEnquiriesGoal: '', scorecardEnquiriesResult: '',
    scorecardConnectionsGoal: '', scorecardConnectionsResult: '', scorecardDownloadsGoal: '', scorecardDownloadsResult: '',
});

interface Persona {
    id: string;
    name: string;
    data: PersonaData;
}

const createNewPersona = (name: string): Persona => ({
    id: uuidv4(),
    name,
    data: createNewPersonaData(),
});

const RowHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <th className="bg-muted/50 p-2 text-left align-top sticky left-0 z-10 w-48">
        <p className="font-bold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground font-normal">{subtitle}</p>}
    </th>
);

const TextareaCell = ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }) => (
    <td className="p-1 align-top">
        <Textarea value={value} onChange={onChange} placeholder={placeholder} className="w-full h-full min-h-[80px] resize-none" />
    </td>
);

const ScorecardCell = ({ goal, onGoalChange, result, onResultChange }: { goal: string; onGoalChange: (e: React.ChangeEvent<HTMLInputElement>) => void; result: string; onResultChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
     <td className="p-1 align-top">
        <div className="flex gap-1">
            <Input value={goal} onChange={onGoalChange} placeholder="Goal" />
            <Input value={result} onChange={onResultChange} placeholder="Result" />
        </div>
    </td>
)

export function MarketingPlanningTemplate() {
    const [personas, setPersonas] = useLocalStorage<Persona[]>('marketing-plan:personas-v1', [createNewPersona('Persona 1')]);
    const [company, setCompany] = useLocalStorage('marketing-plan:company', '');
    const [product, setProduct] = useLocalStorage('marketing-plan:product', '');

    const addPersona = () => {
        setPersonas(prev => [...prev, createNewPersona(`Persona ${prev.length + 1}`)]);
    };

    const removePersona = (id: string) => {
        setPersonas(prev => prev.filter(p => p.id !== id));
    };

    const handlePersonaNameChange = (id: string, name: string) => {
        setPersonas(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    };

    const handleDataChange = (id: string, field: keyof PersonaData, value: string) => {
        setPersonas(prev => prev.map(p =>
            p.id === id ? { ...p, data: { ...p.data, [field]: value } } : p
        ));
    };

    return (
        <div className="w-full h-full flex flex-col p-4 md:p-6 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Marketing Strategy Planning Template</CardTitle>
                    <CardDescription className="text-center">Define your strategy for each buyer persona.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <label className="font-semibold">COMPANY:</label>
                        <Input value={company} onChange={e => setCompany(e.target.value)} />
                    </div>
                     <div className="flex items-center gap-2">
                        <label className="font-semibold">PRODUCT/SERVICE:</label>
                        <Input value={product} onChange={e => setProduct(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="w-full h-full">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-muted z-10 w-48 border p-2"></th>
                                {personas.map(persona => (
                                    <th key={persona.id} className="p-1 border min-w-[300px]">
                                        <div className="flex items-center gap-1">
                                            <Input value={persona.name} onChange={e => handlePersonaNameChange(persona.id, e.target.value)} className="font-bold text-center border-none" />
                                            <Button variant="ghost" size="icon" onClick={() => removePersona(persona.id)} disabled={personas.length <= 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </th>
                                ))}
                                <th className="w-24 p-1">
                                     <Button size="sm" onClick={addPersona}><Plus className="mr-2 h-4 w-4"/>Add Persona</Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <RowHeader title="WHO" subtitle="Buyer Persona" />
                                {personas.map(p => <TextareaCell key={p.id} value={p.data.description} onChange={e => handleDataChange(p.id, 'description', e.target.value)} placeholder="Who is this person?" />)}
                                <td></td>
                            </tr>
                            <tr>
                                <RowHeader title="WHAT" subtitle="Problems you solve for this buyer?" />
                                {personas.map(p => <TextareaCell key={p.id} value={p.data.problems} onChange={e => handleDataChange(p.id, 'problems', e.target.value)} />)}
                                <td></td>
                            </tr>
                             <tr>
                                <RowHeader title="" subtitle="Why are they buying from you?" />
                                {personas.map(p => <TextareaCell key={p.id} value={p.data.whyBuying} onChange={e => handleDataChange(p.id, 'whyBuying', e.target.value)} />)}
                                <td></td>
                            </tr>
                             <tr className="bg-muted/30"><td colSpan={personas.length + 2} className="p-2 font-semibold text-muted-foreground">Actions you'd like them to take:</td></tr>
                             <tr>
                                <RowHeader title="" subtitle="Purchase" />
                                {personas.map(p => <TextareaCell key={p.id} value={p.data.actionPurchase} onChange={e => handleDataChange(p