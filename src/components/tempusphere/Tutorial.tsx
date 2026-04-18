"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from '../ui/sheet';
import { Button } from '../ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, Clock, Globe, AlarmClock, Hourglass, Timer, Scale, Users, CalendarDays, Palette, Expand, Settings, Moon, Sun, Atom, Briefcase, ListChecks, KanbanSquare, LayoutDashboard, BarChartHorizontal, DraftingCompass, Table, Calendar, GitCommit, Brain, Banknote, FileText, BrainCircuit, IterationCw, Megaphone, TrendingUp, BookCopy } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { usePathname } from 'next/navigation';

const appGuideSections = [
    {
        title: "Header Bar",
        icon: <div className="w-5 h-5" />,
        content: (
            <div className="space-y-2">
                <p>The bar at the top of the page contains main navigation and universal controls:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Tempusphere Logo</strong>: Click to return to the landing page.</li>
                    <li><strong>Vibratom Studios Icon (<Atom className="inline h-4 w-4"/>)</strong>: Opens the main Vibratom Studios website in a new tab.</li>
                    <li><strong>Theme Toggle (<Sun className="inline h-4 w-4"/>/<Moon className="inline h-4 w-4"/>)</strong>: Instantly switch between light and dark mode.</li>
                    <li><strong>Clock Settings (<Settings className="inline h-4 w-4"/>)</strong>: Opens a panel to customize clock formats, timezones, and display sizes.</li>
                    <li><strong>Fullscreen Button (<Expand className="inline h-4 w-4"/>)</strong>: Toggles a distraction-free fullscreen view. Press 'F' on your keyboard as a shortcut.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Primary Clock",
        icon: <Clock />,
        content: (
             <div className="space-y-2">
                <p>This is your main clock display. You can customize its appearance from the <strong>Appearance</strong> tab (Alt+8). Options include:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Style</strong>: Switch between a Digital and Analog display.</li>
                    <li><strong>Timezone</strong>: Set to your Local time or UTC.</li>
                    <li><strong>Size</strong>: Adjust the size of the clock display.</li>
                </ul>
            </div>
        )
    },
    {
        title: "World Clocks Panel (Alt+1)",
        icon: <Globe />,
        content: (
            <div className="space-y-2">
                <p>Keep track of time in different cities around the world.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Add a Clock</strong>: Use the search box to find a timezone and click 'Add'.</li>
                    <li><strong>Remove a Clock</strong>: Click the 'X' button next to any clock to remove it.</li>
                    <li><strong>Toggle View</strong>: Click the watch/clock icon on a row to switch between digital and analog views for that specific clock.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Alarms Panel (Alt+2)",
        icon: <AlarmClock />,
        content: (
             <div className="space-y-2">
                <p>Set multiple alarms.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Add an Alarm</strong>: Use the form at the top to set a time, name, and sound, then click 'Add Alarm'.</li>
                    <li><strong>Enable/Disable</strong>: Use the switch next to an alarm to turn it on or off.</li>
                    <li><strong>Preview Sound</strong>: Click the volume icon to hear the selected alarm sound.</li>
                    <li><strong>Notifications</strong>: Enable browser notifications for a better experience when an alarm goes off.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Stopwatch Panel (Alt+3)",
        icon: <Hourglass />,
        content: (
             <div className="space-y-2">
                <p>A high-precision stopwatch.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Start/Pause</strong>: Toggles the stopwatch (Keyboard: Spacebar).</li>
                    <li><strong>Lap</strong>: Records the current time without stopping (Keyboard: L).</li>
                    <li><strong>Reset</strong>: Resets the stopwatch and clears all laps (Keyboard: R).</li>
                    <li><strong>Toggle View</strong>: Switch between digital and analog display styles.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Timer Panel (Alt+4)",
        icon: <Timer />,
        content: (
            <div className="space-y-2">
                <p>A flexible countdown timer.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Set Duration</strong>: Click the numbers to type in hours, minutes, and seconds when the timer is not running.</li>
                    <li><strong>Start/Pause</strong>: Begins or pauses the countdown (Keyboard: Spacebar).</li>
                    <li><strong>Reset</strong>: Resets the timer to its initial duration (Keyboard: R).</li>
                    <li><strong>Toggle View</strong>: Switch between digital and analog display styles.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Converter Panel (Alt+5)",
        icon: <Scale />,
        content: (
             <div className="space-y-2">
                <p>Convert dates and times across multiple timezones.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Set Source</strong>: Use the top row to select the date, time, and timezone you want to convert from.</li>
                    <li><strong>Add Target</strong>: Use the search box below the source to add more timezones to the list.</li>
                    <li><strong>Results</strong>: The list automatically updates to show the corresponding time in all target timezones.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Planner Panel (Alt+6)",
        icon: <Users />,
        content: (
            <div className="space-y-2">
                <p>Find the best meeting time across several timezones.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Add Timezones</strong>: Add all the timezones of the meeting participants.</li>
                    <li><strong>Suggest Times</strong>: Click the 'Suggest' button to get a list of ideal meeting slots based on typical business hours (8am - 6pm).</li>
                    <li><strong>Ideal Slots</strong>: Suggestions marked as 'Ideal' mean the time falls within business hours for all participants.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Calendar Panel (Alt+7)",
        icon: <CalendarDays />,
        content: (
            <div className="space-y-2">
                <p>A personal event management tool.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Select a Day</strong>: Click any day on the calendar to view and add events for that date.</li>
                    <li><strong>Add Event</strong>: Use the form to specify a title, time, description, and color for your event.</li>
                    <li><strong>Event Categories</strong>: Use the tabs (Personal, Work, etc.) to organize your events. You can add new categories by clicking the '+' button.</li>
                    <li><strong>On This Day</strong>: Click the 'On This Day' button to see historical events that happened on the selected date.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Appearance Panel (Alt+8)",
        icon: <Palette />,
        content: (
            <div className="space-y-2">
                <p>Customize the look and feel of Tempusphere.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Background Image</strong>: Choose from a list of presets or upload your own image. You can also remove the image to go back to a solid color.</li>
                    <li><strong>Manual Colors</strong>: Use the color pickers to set your own Primary, Accent, and Background colors.</li>
                    <li><strong>Fullscreen Layout</strong>: Toggle which panels you want to see when you enter Fullscreen mode.</li>
                </ul>
            </div>
        )
    }
];

const landingPageGuide = [
    {
        title: "Header Bar",
        icon: <div className="w-5 h-5" />,
        content: (
            <div className="space-y-2">
                <p>The bar at the top of the page contains main navigation and universal controls:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Tempusphere Logo</strong>: Click to return to the landing page.</li>
                    <li><strong>Vibratom Studios Icon (<Atom className="inline h-4 w-4"/>)</strong>: Opens the main Vibratom Studios website in a new tab.</li>
                    <li><strong>Theme Toggle (<Sun className="inline h-4 w-4"/>/<Moon className="inline h-4 w-4"/>)</strong>: Instantly switch between light and dark mode.</li>
                    <li><strong>Clock Settings (<Settings className="inline h-4 w-4"/>)</strong>: Opens a panel to customize clock formats and timezones (this primarily affects the /app page).</li>
                    <li><strong>Fullscreen Button (<Expand className="inline h-4 w-4"/>)</strong>: Toggles a distraction-free fullscreen view of the main app dashboard. Press 'F' on your keyboard as a shortcut.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Main Application Tools",
        icon: <Briefcase />,
        content: (
            <div className="space-y-2">
                <p>These are the main applications within Tempusphere. Each one is a powerful tool designed to help with different aspects of your work and life.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Clock</strong>: The core time-keeping features of Tempusphere.</li>
                    <li><strong>Projects</strong>: Manage projects with Kanban boards, Gantt charts, and more.</li>
                    <li><strong>Productivity</strong>: A suite of tools for business analysis and strategic planning.</li>
                    <li><strong>Finance</strong>: Track expenses, create budgets, and generate financial reports.</li>
                    <li><strong>Culinary</strong>: Organize recipes, manage inventory, and calculate food costs.</li>
                </ul>
            </div>
        )
    },
     {
        title: "Features at a Glance",
        icon: <ListChecks />,
        content: (
            <p>Explore this accordion to get a quick overview of all the powerful features packed into Tempusphere, from basic time management to advanced project and financial planning.</p>
        )
    },
    {
        title: "Vibratom Studios Ecosystem",
        icon: <Atom />,
        content: (
            <p>Tempusphere is part of a larger ecosystem of applications. Discover other tools from Vibratom Studios designed to boost your productivity and creativity, all linked in the footer.</p>
        )
    }
];

const projectsGuide = [
    {
        title: "Project Navigation",
        icon: <KanbanSquare />,
        content: (
            <div className="space-y-2">
                <p>The top navigation bar allows you to switch between different views and tools within the Projects section.</p>
            </div>
        )
    },
    {
        title: "Dashboard",
        icon: <LayoutDashboard />,
        content: (
            <p>The dashboard provides a high-level overview of your projects, including key statistics, task progress, upcoming deadlines, and budget summaries.</p>
        )
    },
    {
        title: "Board View",
        icon: <KanbanSquare />,
        content: (
            <p>A Kanban-style board to visualize your workflow. Drag and drop tasks between columns to update their status. You can add new columns and tasks, and import/export your entire board.</p>
        )
    },
    {
        title: "List View",
        icon: <ListChecks />,
        content: (
            <p>A comprehensive table view of all your project tasks. You can sort by title, status, priority, or dates. Click on any task to open an editor with more details.</p>
        )
    },
    {
        title: "Calendar",
        icon: <Calendar />,
        content: (
            <p>Project tasks with a start or due date are automatically displayed on this calendar, giving you a clear monthly view of your schedule.</p>
        )
    },
    {
        title: "Gantt Chart",
        icon: <BarChartHorizontal />,
        content: (
            <p>A timeline view of your project schedule. It shows task durations, helping you manage deadlines and resource allocation effectively.</p>
        )
    },
    {
        title: "Bookkeeping",
        icon: <Banknote />,
        content: (
            <p>Link financial transactions directly to your projects. This view provides a summary of income, expenses, and net balance for each project, helping you track financial health.</p>
        )
    },
    {
        title: "Spreadsheet",
        icon: <Table />,
        content: (
            <p>A lightweight, integrated spreadsheet for quick calculations, data management, or tabular notes related to your projects.</p>
        )
    },
    {
        title: "Checklist",
        icon: <ListChecks />,
        content: (
            <p>Create and manage detailed checklists for specific project tasks. Supports sub-tasks, priorities, and recurring items.</p>
        )
    },
    {
        title: "Canvas",
        icon: <DraftingCompass />,
        content: (
            <p>A freeform design canvas for creating diagrams, mockups, or any visual aid your project requires. Supports text, drawing, and image uploads.</p>
        )
    },
    {
        title: "Chart Editor",
        icon: <GitCommit />,
        content: (
            <p>Create various types of charts and diagrams using a simple visual editor or by writing Mermaid syntax for more complex visualizations.</p>
        )
    },
    {
        title: "Mind Map",
        icon: <Brain />,
        content: (
            <p>A text-based mind mapping tool perfect for brainstorming sessions and structuring complex thoughts visually.</p>
        )
    }
];

const productivityGuide = [
    {
        title: "Productivity Navigation",
        icon: <Briefcase />,
        content: (
            <div className="space-y-2">
                <p>The top navigation bar allows you to switch between different tools within the Productivity section.</p>
            </div>
        )
    },
    {
        title: "Dashboard",
        icon: <LayoutDashboard />,
        content: (
            <p>The dashboard provides a high-level overview of your strategic planning and sales analysis activities, including key metrics on deals won/lost and progress on strategic frameworks.</p>
        )
    },
    {
        title: "Minutes of Meeting (MoM)",
        icon: <FileText />,
        content: (
            <p>A structured tool to capture notes, action items, and key decisions from your meetings. You can choose from various templates like Board Meeting, Daily Scrum, or a flexible custom builder. Your data can be exported in multiple formats.</p>
        )
    },
    {
        title: "Strategic Analysis",
        icon: <BrainCircuit />,
        content: (
            <p>A suite of classic strategic frameworks to analyze your business and market landscape. This includes SWOT, TOWS, SOAR, SCORE, PESTLE, Porter's Five Forces, VRIO, and the McKinsey 7-S model.</p>
        )
    },
    {
        title: "Customer Lifecycle Management (CLM)",
        icon: <IterationCw />,
        content: (
            <p>Map and optimize every stage of the customer journey, from awareness and acquisition to retention and advocacy. Define key metrics, actions, and notes for each stage.</p>
        )
    },
    {
        title: "Marketing",
        icon: <Megaphone />,
        content: (
            <p>Plan your content using the Hero, Hub, Help framework and define your overall marketing strategy with a comprehensive checklist. This section also includes a detailed Marketing Planning Template for different buyer personas.</p>
        )
    },
    {
        title: "Win/Loss Analysis",
        icon: <TrendingUp />,
        content: (
            <p>Analyze your sales outcomes to identify trends, understand why you win or lose deals, and refine your sales strategy for better results.</p>
        )
    }
];

const financeGuide = [
    {
        title: "Finance Navigation",
        icon: <div className="w-5 h-5" />,
        content: (
            <div className="space-y-2">
                <p>The top navigation bar allows you to switch between different tools within the Finance section.</p>
            </div>
        )
    },
    {
        title: "Dashboard",
        icon: <LayoutDashboard />,
        content: (
            <p>The dashboard provides a high-level overview of your finances, including total income, expenses, net balance, and accounts receivable/payable. It also features charts for your Income Statement, Balance Sheet, Cash Flow, and a dynamic report builder.</p>
        )
    },
    {
        title: "Journal & Ledger",
        icon: <BookCopy />,
        content: (
            <p>Record financial transactions using double-entry bookkeeping. You can select from pre-defined templates (e.g., "Cash sale of goods") or create custom entries. All transactions are compiled into a comprehensive Ledger. This section also tracks unpaid invoices in Accounts Receivable and upcoming bills in Accounts Payable.</p>
        )
    },
    {
        title: "Budget",
        icon: <Banknote />,
        content: (
            <p>Set monthly or yearly spending limits for your transaction categories to monitor your financial health. The Budget Health summary on the Dashboard will track your progress against these limits.</p>
        )
    },
    {
        title: "Reports",
        icon: <FileText />,
        content: (
            <p>Generate standard financial statements including the Income Statement, Balance Sheet, and Statement of Cash Flows. You can adjust the reporting period and switch between different accounting standards (GAAP, IFRS, HGB).</p>
        )
    }
];

const pageGuides: Record<string, any[]> = {
    '/': landingPageGuide,
    '/app': appGuideSections,
    '/projects': projectsGuide,
    '/productivity': productivityGuide,
    '/finance': financeGuide,
};

export function Tutorial() {
    const pathname = usePathname();
    const guideKey = pathname.startsWith('/projects') ? '/projects' : pathname.startsWith('/productivity') ? '/productivity' : pathname.startsWith('/finance') ? '/finance' : pathname;
    const guideSections = pageGuides[guideKey];

    const content = guideSections ? (
        <ScrollArea className="flex-1 px-6">
            <Accordion type="single" collapsible className="w-full">
                {guideSections.map((section, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-md font-semibold hover:no-underline py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 p-1.5 bg-primary/10 rounded-full">
                                    {React.cloneElement(section.icon, { className: 'w-5 h-5 text-primary' })}
                                </div>
                                <span>{section.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground pl-12">
                            {section.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </ScrollArea>
    ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Guide Not Available</h3>
            <p className="text-muted-foreground">A detailed guide for this page has not been created yet.</p>
        </div>
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <BookOpen className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col p-0" side="left">
                <SheetHeader className="p-6 pb-4">
                    <SheetTitle>Static Guide</SheetTitle>
                    <SheetDescription>
                        A reference for all features on the current page.
                    </SheetDescription>
                </SheetHeader>
                {content}
            </SheetContent>
        </Sheet>
    );
}
