
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
import { BookOpen, Clock, Globe, AlarmClock, Hourglass, Timer, Scale, Users, CalendarDays, Palette, Expand, Settings, Moon, Sun, Atom } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const guideSections = [
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

export function Tutorial() {
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
                        A complete reference for all features on this page.
                    </SheetDescription>
                </SheetHeader>
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
            </SheetContent>
        </Sheet>
    );
}
