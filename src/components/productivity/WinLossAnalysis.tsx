
'use client';

import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type Outcome = 'win' | 'loss';

interface Analysis {
    id: string;
    client: string;
    value: number;
    reason: string;
    learnings: string;
    outcome: Outcome;
}

const AnalysisForm = ({ onSave, analysis, onCancel }: { onSave: (data: Partial<Analysis>) => void, analysis?: Analysis, onCancel: () => void }) => {
    const [client, setClient] = useState(analysis?.client || '');
    const [value, setValue] = useState(analysis?.value || 0);
    const [reason, setReason] = useState(analysis?.reason || '');
    const [learnings, setLearnings] = useState(analysis?.learnings || '');

    const handleSave = () => {
        onSave({ client, value, reason, learnings });
        onCancel();
    };
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{analysis ? 'Edit Analysis' : 'New Analysis'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="client">Client/Deal Name</Label>
                        <Input id="client" value={client} onChange={e => setClient(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="value">Deal Value</Label>
                        <Input id="value" type="number" value={value} onChange={e => setValue(parseInt(e.target.value) || 0)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reason">Primary Reason for Outcome</Label>
                    <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="learnings">Key Learnings & Action Items</Label>
                    <Textarea id="learnings" value={learnings} onChange={e => setLearnings(e.target.value)} rows={3} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export function WinLossAnalysis() {
    const [analyses, setAnalyses] = useLocalStorage<Analysis[]>('win-loss-analysis:v1', []);
    const [editingAnalysis, setEditingAnalysis] = useState<Analysis | null>(null);
    const [formOutcome, setFormOutcome] = useState<Outcome | null>(null);
    const { toast } = useToast();
    
    const { wins, losses, totalWon, totalLost, winRate } = useMemo(() => {
        const wins = analyses.filter(a => a.outcome === 'win');
        const losses = analyses.filter(a => a.outcome === 'loss');
        const totalWon = wins.reduce((sum, a) => sum + a.value, 0);
        const totalLost = losses.reduce((sum, a) => sum + a.value, 0);
        const totalDeals = analyses.length;
        const winRate = totalDeals > 0 ? (wins.length / totalDeals) * 100 : 0;
        return { wins, losses, totalWon, totalLost, winRate };
    }, [analyses]);

    const handleOpenForm = (outcome: Outcome, analysis?: Analysis) => {
        setFormOutcome(outcome);
        setEditingAnalysis(analysis || null);
    };

    const handleSave = (data: Partial<Analysis>) => {
        if (editingAnalysis) {
            setAnalyses(prev => prev.map(a => a.id === editingAnalysis.id ? { ...a, ...data } : a));
            toast({ title: "Analysis Updated" });
        } else if (formOutcome) {
            const newAnalysis: Analysis = {
                id: uuidv4(),
                client: data.client || 'New Deal',
                value: data.value || 0,
                reason: data.reason || '',
                learnings: data.learnings || '',
                outcome: formOutcome,
            };
            setAnalyses(prev => [...prev, newAnalysis]);
            toast({ title: "Analysis Added" });
        }
        setEditingAnalysis(null);
        setFormOutcome(null);
    };
    
    const handleDelete = (id: string) => {
        setAnalyses(prev => prev.filter(a => a.id !== id));
        toast({ title: "Analysis Deleted" });
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
             <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Win/Loss Analysis</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Analyze your sales outcomes to identify trends and improve your strategy.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-100/30 dark:bg-green-900/30 border-green-500">
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp/>Total Won</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">${totalWon.toLocaleString()}</p></CardContent>
                </Card>
                 <Card className="bg-red-100/30 dark:bg-red-900/30 border-red-500">
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown/>Total Lost</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">${totalLost.toLocaleString()}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Win Rate</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{winRate.toFixed(1)}%</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Wins</CardTitle>
                        <Button size="sm" onClick={() => handleOpenForm('win')}><Plus className="mr-2 h-4 w-4"/>Add Win</Button>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-96 pr-4">
                            <div className="space-y-3">
                                {wins.map(analysis => (
                                    <Card key={analysis.id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex justify-between items-start">
                                                <span>{analysis.client}</span>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('win', analysis)}><Edit className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(analysis.id)}><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1"><DollarSign className="h-4 w-4"/> ${analysis.value.toLocaleString()}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground"><strong className="text-foreground">Reason:</strong> {analysis.reason}</p>
                                            <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">Learning:</strong> {analysis.learnings}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {wins.length === 0 && <p className="text-center text-muted-foreground pt-16">No wins recorded yet.</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Losses</CardTitle>
                        <Button size="sm" variant="destructive" onClick={() => handleOpenForm('loss')}><Plus className="mr-2 h-4 w-4"/>Add Loss</Button>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-96 pr-4">
                             <div className="space-y-3">
                                {losses.map(analysis => (
                                    <Card key={analysis.id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex justify-between items-start">
                                                <span>{analysis.client}</span>
                                                <div className="flex gap-1">
                                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('loss', analysis)}><Edit className="h-4 w-4"/></Button>
                                                     <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(analysis.id)}><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1"><DollarSign className="h-4 w-4"/> ${analysis.value.toLocaleString()}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground"><strong className="text-foreground">Reason:</strong> {analysis.reason}</p>
                                            <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">Learning:</strong> {analysis.learnings}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {losses.length === 0 && <p className="text-center text-muted-foreground pt-16">No losses recorded yet.</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={!!formOutcome} onOpenChange={(open) => !open && (setEditingAnalysis(null), setFormOutcome(null))}>
                <AnalysisForm onSave={handleSave} analysis={editingAnalysis || undefined} onCancel={() => {setEditingAnalysis(null); setFormOutcome(null)}}/>
            </Dialog>

        </div>
    )
}
