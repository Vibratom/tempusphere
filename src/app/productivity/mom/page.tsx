
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Download, Eraser, NotebookPen, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { meetingTemplates, type MeetingTemplate } from '@/lib/meeting-templates';
import { BoardMeetingTemplate } from '@/components/productivity/BoardMeetingTemplate';
import { AnnualMeetingTemplate } from '@/components/productivity/AnnualMeetingTemplate';
import { ProjectKickoffTemplate } from '@/components/productivity/ProjectKickoffTemplate';
import { DailyScrumTemplate } from '@/components/productivity/DailyScrumTemplate';
import { OneOnOneTemplate } from '@/components/productivity/OneOnOneTemplate';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


type TemplateType = 'default' | 'board-meeting' | 'annual-meeting' | 'project-kick-off' | 'daily-scrum' | 'one-on-one';

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

function DefaultMeetingMinutesTool() {
  const [minutes, setMinutes] = useLocalStorage<MeetingMinutes>('productivity:meeting-minutes-v1', {
    title: '',
    date: new Date().toISOString().split('T')[0],
    attendees: '',
    notes: '',
    actionItems: [],
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
  
  const generateMarkdown = () => {
    let markdown = `# ${minutes.title || 'Meeting Minutes'}\n\n`;
    markdown += `**Date:** ${minutes.date}\n`;
    markdown += `**Attendees:** ${minutes.attendees}\n\n`;
    markdown += `## Discussion Notes\n\n${minutes.notes}\n\n`;
    markdown += `## Action Items\n\n`;
    minutes.actionItems.forEach(item => {
      markdown += `- [${item.done ? 'x' : ' '}] ${item.text} (@${item.owner})\n`;
    });
    return markdown;
  }

  const exportToMarkdown = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${(minutes.title || 'meeting_minutes').replace(/ /g, '_')}.md`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Exported to Markdown", description: "Your meeting minutes are downloading." });
  };

  return (
    <>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Meeting Minutes Preview</DialogTitle>
            <DialogDescription>This is how your exported document will look.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] my-4 border rounded-md p-4 bg-muted/50">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              <h2>{minutes.title || 'Meeting Minutes'}</h2>
              <p><strong>Date:</strong> {minutes.date}</p>
              <p><strong>Attendees:</strong> {minutes.attendees}</p>
              <h3>Discussion Notes</h3>
              <p>{minutes.notes}</p>
              <h3>Action Items</h3>
              <ul>
                {minutes.actionItems.map(item => (
                  <li key={item.id}>
                    <input type="checkbox" checked={item.done} readOnly className="mr-2" />
                    {item.text} {item.owner && `(@${item.owner})`}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        </DialogContent>
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

          <CardHeader className="border-t pt-6">
              <CardTitle>Discussion Notes</CardTitle>
          </CardHeader>
          <CardContent>
              <Textarea value={minutes.notes} onChange={e => handleInputChange('notes', e.target.value)} rows={10} placeholder="Key points discussed, decisions made, open questions..." />
          </CardContent>

          <CardHeader className="border-t pt-6">
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
              <Button variant="outline" onClick={clearForm}><Eraser className="mr-2 h-4 w-4" /> Clear Form</Button>
              <Button variant="secondary" onClick={() => setIsPreviewOpen(true)}><Eye className="mr-2 h-4 w-4" /> Preview</Button>
              <Button onClick={exportToMarkdown}><Download className="mr-2 h-4 w-4" /> Export to Markdown</Button>
          </CardFooter>
      </Card>
    </>
  );
}


export default function MoMPage() {
    const [activeTemplate, setActiveTemplate] = useLocalStorage<TemplateType>('productivity:active-template-v1', 'default');
    const { toast } = useToast();

    const handleTemplateSelect = (templateId: string) => {
        const selectedTemplate = meetingTemplates.find(t => t.id === templateId);
        if (selectedTemplate) {
            setActiveTemplate(templateId as TemplateType);
            toast({ title: 'Template Changed', description: `Switched to ${selectedTemplate.name}.` });
        }
    };
    
    const activeTemplateName = meetingTemplates.find(t => t.id === activeTemplate)?.name || 'Default Template';

    const renderActiveTemplate = () => {
        switch (activeTemplate) {
            case 'board-meeting':
                return <BoardMeetingTemplate />;
            case 'annual-meeting':
                return <AnnualMeetingTemplate />;
            case 'project-kick-off':
                return <ProjectKickoffTemplate />;
            case 'daily-scrum':
                return <DailyScrumTemplate />;
            case 'one-on-one':
                return <OneOnOneTemplate />;
            case 'default':
            default:
                return <DefaultMeetingMinutesTool />;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Meeting Minutes</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    A structured tool to capture notes, action items, and key decisions from your meetings. Your data is saved locally.
                </p>
            </div>

             <div className="mb-4 text-center">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <NotebookPen className="mr-2 h-4 w-4"/> Change Template
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={activeTemplate} onValueChange={handleTemplateSelect}>
                            {meetingTemplates.map(template => (
                                <DropdownMenuRadioItem key={template.id} value={template.id}>
                                    {template.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                 </DropdownMenu>
             </div>
             
            <div className="text-center mb-6">
                 <h2 className="text-2xl font-semibold text-muted-foreground">{activeTemplateName}</h2>
            </div>
            
            {renderActiveTemplate()}
        </div>
    );
}

    