
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Download, Eraser, NotebookPen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { meetingTemplates, type MeetingTemplate } from '@/lib/meeting-templates';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActionItem {
  id: string;
  text: string;
  owner: string;
  done: boolean;
}

interface MeetingMinutes {
  title: string;
  date: string;
  attendees: string;
  notes: string;
  actionItems: ActionItem[];
}

const TemplateSelector = ({ onSelect }: { onSelect: (template: MeetingTemplate) => void }) => {
    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
                <DialogDescription>Select a template to pre-fill the meeting notes with a structured format.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
                <div className="space-y-2 pr-4">
                    {meetingTemplates.map(template => (
                        <Card key={template.name} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelect(template)}>
                            <CardHeader>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <CardDescription>{template.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
    );
};

function MeetingMinutesTool() {
  const [minutes, setMinutes] = useLocalStorage<MeetingMinutes>('productivity:meeting-minutes-v1', {
    title: '',
    date: new Date().toISOString().split('T')[0],
    attendees: '',
    notes: '',
    actionItems: [],
  });
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  const { toast } = useToast();

  const handleInputChange = (field: keyof MeetingMinutes, value: string) => {
    setMinutes(prev => ({ ...prev, [field]: value }));
  };

  const addActionItem = () => {
    setMinutes(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { id: Date.now().toString(), text: '', owner: '', done: false }],
    }));
  };

  const updateActionItem = (id: string, field: keyof ActionItem, value: string | boolean) => {
    setMinutes(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeActionItem = (id: string) => {
    setMinutes(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== id),
    }));
  };
  
  const clearForm = () => {
    setMinutes({
        title: '',
        date: new Date().toISOString().split('T')[0],
        attendees: '',
        notes: '',
        actionItems: [],
    });
    toast({ title: "Form Cleared", description: "The meeting minutes have been reset." });
  }

  const applyTemplate = (template: MeetingTemplate) => {
    setMinutes(prev => ({
        ...prev,
        title: prev.title || template.name,
        notes: template.content,
    }));
    setIsTemplateSelectorOpen(false);
    toast({ title: "Template Applied", description: `The "${template.name}" template has been loaded into the notes.`});
  }

  const exportToMarkdown = () => {
    let markdown = `# ${minutes.title || 'Meeting Minutes'}\n\n`;
    markdown += `**Date:** ${minutes.date}\n`;
    markdown += `**Attendees:** ${minutes.attendees}\n\n`;
    markdown += `## Notes\n\n${minutes.notes}\n\n`;
    markdown += `## Action Items\n\n`;
    minutes.actionItems.forEach(item => {
      markdown += `- [${item.done ? 'x' : ' '}] ${item.text} (@${item.owner})\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${minutes.title.replace(/ /g, '_') || 'meeting_minutes'}.md`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Exported to Markdown", description: "Your meeting minutes are downloading." });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Meeting Minutes</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                A structured tool to capture notes, action items, and key decisions from your meetings. Your data is saved locally.
            </p>
        </div>

        <Dialog open={isTemplateSelectorOpen} onOpenChange={setIsTemplateSelectorOpen}>
            <TemplateSelector onSelect={applyTemplate} />
        </Dialog>

        <Card>
            <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Meeting Title</Label>
                        <Input id="title" value={minutes.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="e.g., Q3 Project Kick-off" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={minutes.date} onChange={e => handleInputChange('date', e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="attendees">Attendees</Label>
                    <Input id="attendees" value={minutes.attendees} onChange={e => handleInputChange('attendees', e.target.value)} placeholder="e.g., Alice, Bob, Charlie" />
                </div>
            </CardContent>

            <CardHeader className="border-t pt-4 flex-row justify-between items-center">
                <CardTitle>Discussion Notes</CardTitle>
                <Button variant="outline" onClick={() => setIsTemplateSelectorOpen(true)}>
                    <NotebookPen className="mr-2 h-4 w-4"/> Templates
                </Button>
            </CardHeader>
            <CardContent>
                <Textarea value={minutes.notes} onChange={e => handleInputChange('notes', e.target.value)} rows={10} placeholder="Key points discussed, decisions made, open questions..." />
            </CardContent>

            <CardHeader className="border-t pt-4">
                <CardTitle>Action Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {minutes.actionItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col md:flex-row items-center gap-2 bg-muted/50 p-3 rounded-lg">
                        <input type="checkbox" checked={item.done} onChange={e => updateActionItem(item.id, 'done', e.target.checked)} className="h-5 w-5 rounded-sm border-primary" />
                        <Input
                            value={item.text}
                            onChange={e => updateActionItem(item.id, 'text', e.target.value)}
                            placeholder={`Action Item ${index + 1}`}
                            className="flex-1"
                        />
                        <Input
                            value={item.owner}
                            onChange={e => updateActionItem(item.id, 'owner', e.target.value)}
                            placeholder="Owner"
                            className="w-full md:w-32"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeActionItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" onClick={addActionItem}><Plus className="mr-2 h-4 w-4" /> Add Action Item</Button>
            </CardContent>

            <CardFooter className="border-t pt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={clearForm}><Eraser className="mr-2" /> Clear Form</Button>
                <Button onClick={exportToMarkdown}><Download className="mr-2" /> Export to Markdown</Button>
            </CardFooter>
        </Card>
    </div>
  );
}


export default function MoMPage() {
    return (
        <MeetingMinutesTool />
    );
}
