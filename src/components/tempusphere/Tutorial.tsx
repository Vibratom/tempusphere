'use client';

import { BookOpen, Pointer, Presentation } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const StaticGuide = ({ onBack }: { onBack: () => void }) => {
    const pathname = usePathname();

    let title = "How to use this page";
    let content: JSX.Element | null = null;

    const HelpSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-4">
            <h4 className="font-semibold text-lg mb-1">{title}</h4>
            <div className="text-muted-foreground text-sm space-y-2">{children}</div>
        </div>
    );

    if (pathname.startsWith('/app')) {
        title = "Main Dashboard Guide";
        content = (
            <>
                <HelpSection title="Primary Clock">
                    <p>The large clock at the top is your main time display. You can customize its style (analog/digital), timezone (local/UTC), and size in the <strong>Appearance</strong> settings (click the palette icon in the header).</p>
                </HelpSection>
                <HelpSection title="Tabbed Panels">
                    <p>Use the tabs below the main clock to switch between different tools:</p>
                    <ul className="list-disc pl-5">
                        <li><strong>World Clocks:</strong> Keep track of time in multiple cities around the globe.</li>
                        <li><strong>Alarms:</strong> Set one-time alarms with customizable sounds.</li>
                        <li><strong>Stopwatch:</strong> A precision timer with lap functionality.</li>
                        <li><strong>Timer:</strong> A countdown timer for any duration.</li>
                        <li><strong>Converter:</strong> Convert dates and times between different timezones.</li>
                        <li><strong>Planner:</strong> Find the best meeting times across several timezones.</li>
                        <li><strong>Calendar:</strong> Manage your personal events and appointments.</li>
                    </ul>
                </HelpSection>
                <HelpSection title="Keyboard Shortcuts">
                    <p>Quickly navigate between tabs using `Alt + 1` through `Alt + 8`.</p>
                    <p>Use the `Spacebar` to start/stop the Stopwatch and Timer when their tabs are active.</p>
                </HelpSection>
            </>
        );
    } else if (pathname.startsWith('/projects/board')) {
        title = "Projects Board Guide";
        content = (
             <>
                <HelpSection title="Columns & Tasks">
                    <p>This is a Kanban board to visualize your workflow.</p>
                    <ul className="list-disc pl-5">
                        <li><strong>Add Columns:</strong> Use the "Add Column" input at the top to create new stages for your workflow (e.g., "Backlog", "In Review").</li>
                        <li><strong>Add Tasks:</strong> Type a task title in the input at the bottom of any column and press Enter to add a new card.</li>
                        <li><strong>Move Items:</strong> Drag and drop tasks between columns to update their status. You can also drag columns to reorder them.</li>
                    </ul>
                </HelpSection>
                <HelpSection title="Editing Tasks">
                    <p>Click on any task card to open the editor. Here you can:</p>
                    <ul className="list-disc pl-5">
                        <li>Add a detailed description.</li>
                        <li>Set a start and due date.</li>
                        <li>Assign a priority (High, Medium, Low).</li>
                    </ul>
                </HelpSection>
                 <HelpSection title="Import/Export">
                    <p>You can save your entire board to a JSON file using the "Export Board" button and load it back later with "Import Board". This is useful for backups or sharing.</p>
                </HelpSection>
            </>
        );
    } else if (pathname.startsWith('/culinary/core-tools/book')) {
        title = "Recipe Book Guide";
        content = (
             <>
                <HelpSection title="Your Digital Cookbook">
                    <p>This is your personal space to store, manage, and use recipes.</p>
                    <ul className="list-disc pl-5">
                        <li><strong>Add a Recipe:</strong> Click "Add New Recipe" to open a form where you can input the title, description, ingredients, and instructions.</li>
                        <li><strong>View a Recipe:</strong> Click on any recipe card to see its full details in a side panel.</li>
                    </ul>
                </HelpSection>
                <HelpSection title="Editing and Managing">
                    <p>Inside the recipe detail view, you have several options:</p>
                    <ul className="list-disc pl-5">
                        <li><strong>Edit:</strong> Modify any part of the recipe.</li>
                        <li><strong>Delete:</strong> Permanently remove the recipe from your cookbook.</li>
                        <li><strong>Remix:</strong> Create a new copy of the recipe to make variations without losing the original. The new version will be linked to the original.</li>
                    </ul>
                </HelpSection>
                <HelpSection title="Prep Checklist">
                     <p>Every recipe has its own dedicated "Prep Checklist" tab. Use this to list out your preparation steps or ingredients for shopping. This checklist is saved automatically with the recipe.</p>
                </HelpSection>
            </>
        );
    }
    // ... add more else if blocks for other pages
    else {
        content = <p>No tutorial available for this page yet. Check back soon!</p>;
    }


    return (
        <div>
            <SheetHeader className="p-6 border-b flex-row items-center justify-between">
                <SheetTitle>{title}</SheetTitle>
                <Button variant="outline" onClick={onBack}>Back</Button>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)]">
                <div className="p-6">
                    {content}
                </div>
            </ScrollArea>
        </div>
    );
};

const TutorialSelection = ({ onSelect }: { onSelect: (mode: 'static' | 'spotlight' | 'interactive') => void }) => (
    <div>
        <SheetHeader className="p-6 border-b">
            <SheetTitle>Choose Your Tutorial</SheetTitle>
            <SheetDescription>How would you like to learn about this page?</SheetDescription>
        </SheetHeader>
        <div className="p-6 space-y-4">
             <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => onSelect('static')}
            >
                <CardHeader className="flex-row items-center gap-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle>Static Guide</CardTitle>
                        <CardDescription>Read a simple, text-based explanation of the page features.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card className="cursor-not-allowed opacity-50 relative">
                <CardHeader className="flex-row items-center gap-4">
                     <Presentation className="w-8 h-8 text-muted-foreground" />
                    <div>
                        <CardTitle>Spotlight Tour</CardTitle>
                        <CardDescription>A guided tour that highlights each feature on the page one by one.</CardDescription>
                    </div>
                </CardHeader>
                <Badge variant="secondary" className="absolute top-2 right-2">Coming Soon</Badge>
            </Card>
            <Card className="cursor-not-allowed opacity-50 relative">
                 <CardHeader className="flex-row items-center gap-4">
                     <Pointer className="w-8 h-8 text-muted-foreground" />
                    <div>
                        <CardTitle>Interactive Walkthrough</CardTitle>
                        <CardDescription>Learn by doing. We'll guide you as you click through the features yourself.</CardDescription>
                    </div>
                </CardHeader>
                <Badge variant="secondary" className="absolute top-2 right-2">Coming Soon</Badge>
            </Card>
        </div>
    </div>
);


const TutorialContent = () => {
    const [mode, setMode] = useState<'selection' | 'static' | 'spotlight' | 'interactive'>('selection');

    if (mode === 'static') {
        return <StaticGuide onBack={() => setMode('selection')} />;
    }

    return <TutorialSelection onSelect={setMode} />;
};


export function Tutorial() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <BookOpen className="h-5 w-5" />
                    <span className="sr-only">Open Tutorial</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="p-0 w-full sm:max-w-md">
                <TutorialContent />
            </SheetContent>
        </Sheet>
    );
}
