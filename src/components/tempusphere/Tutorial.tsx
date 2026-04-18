
'use client';

import { BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';

const TutorialContent = () => {
    const pathname = usePathname();

    let title = "How to use this page";
    let content: JSX.Element | null = null;

    // A helper component for consistent styling
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
            <SheetHeader className="p-6 border-b">
                <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)]">
                <div className="p-6">
                    {content}
                </div>
            </ScrollArea>
        </div>
    );
}


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
