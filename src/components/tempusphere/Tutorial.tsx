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
        content: `The bar at the top of the page contains main navigation and universal controls:
        - **Tempusphere Logo**: Click to return to the landing page.
        - **Vibratom Studios Icon (${<Atom className="inline h-4 w-4"/>})**: Opens the main Vibratom Studios website in a new tab.
        - **Theme Toggle (${<Sun className="inline h-4 w-4"/>}/${<Moon className="inline h-4 w-4"/>})**: Instantly switch between light and dark mode.
        - **Clock Settings (${<Settings className="inline h-4 w-4"/>})**: Opens a panel to customize clock formats, timezones, and display sizes.
        - **Fullscreen Button (${<Expand className="inline h-4 w-4"/>})**: Toggles a distraction-free fullscreen view. Press 'F' on your keyboard as a shortcut.`
    },
    {
        title: "Primary Clock",
        icon: <Clock />,
        content: `This is your main clock display. You can customize its appearance from the **Appearance** tab (Alt+8). Options include:
        - **Style**: Switch between a Digital and Analog display.
        - **Timezone**: Set to your Local time or UTC.
        - **Size**: Adjust the size of the clock display.`
    },
    {
        title: "World Clocks Panel (Alt+1)",
        icon: <Globe />,
        content: `Keep track of time in different cities around the world.
        - **Add a Clock**: Use the search box to find a timezone and click 'Add'.
        - **Remove a Clock**: Click the 'X' button next to any clock to remove it.
        - **Toggle View**: Click the watch/clock icon on a row to switch between digital and analog views for that specific clock.`
    },
    {
        title: "Alarms Panel (Alt+2)",
        icon: <AlarmClock />,
        content: `Set multiple alarms.
        - **Add an Alarm**: Use the form at the top to set a time, name, and sound, then click 'Add Alarm'.
        - **Enable/Disable**: Use the switch next to an alarm to turn it on or off.
        - **Preview Sound**: Click the volume icon to hear the selected alarm sound.
        - **Notifications**: Enable browser notifications for a better experience when an alarm goes off.`
    },
    {
        title: "Stopwatch Panel (Alt+3)",
        icon: <Hourglass />,
        content: `A high-precision stopwatch.
        - **Start/Pause**: Toggles the stopwatch (Keyboard: Spacebar).
        - **Lap**: Records the current time without stopping (Keyboard: L).
        - **Reset**: Resets the stopwatch and clears all laps (Keyboard: R).
        - **Toggle View**: Switch between digital and analog display styles.`
    },
    {
        title: "Timer Panel (Alt+4)",
        icon: <Timer />,
        content: `A flexible countdown timer.
        - **Set Duration**: Click the numbers to type in hours, minutes, and seconds when the timer is not running.
        - **Start/Pause**: Begins or pauses the countdown (Keyboard: Spacebar).
        - **Reset**: Resets the timer to its initial duration (Keyboard: R).
        - **Toggle View**: Switch between digital and analog display styles.`
    },
    {
        title: "Converter Panel (Alt+5)",
        icon: <Scale />,
        content: `Convert dates and times across multiple timezones.
        - **Set Source**: Use the top row to select the date, time, and timezone you want to convert from.
        - **Add Target**: Use the search box below the source to add more timezones to the list.
        - **Results**: The list automatically updates to show the corresponding time in all target timezones.`
    },
    {
        title: "Planner Panel (Alt+6)",
        icon: <Users />,
        content: `Find the best meeting time across several timezones.
        - **Add Timezones**: Add all the timezones of the meeting participants.
        - **Suggest Times**: Click the 'Suggest' button to get a list of ideal meeting slots based on typical business hours (8am - 6pm).
        - **Ideal Slots**: Suggestions marked as 'Ideal' mean the time falls within business hours for all participants.`
    },
    {
        title: "Calendar Panel (Alt+7)",
        icon: <CalendarDays />,
        content: `A personal event management tool.
        - **Select a Day**: Click any day on the calendar to view and add events for that date.
        - **Add Event**: Use the form to specify a title, time, description, and color for your event.
        - **Event Categories**: Use the tabs (Personal, Work, etc.) to organize your events. You can add new categories by clicking the '+' button.
        - **On This Day**: Click the 'On This Day' button to see historical events that happened on the selected date.`
    },
    {
        title: "Appearance Panel (Alt+8)",
        icon: <Palette />,
        content: `Customize the look and feel of Tempusphere.
        - **Background Image**: Choose from a list of presets or upload your own image. You can also remove the image to go back to a solid color.
        - **Manual Colors**: Use the color pickers to set your own Primary, Accent, and Background colors.
        - **Fullscreen Layout**: Toggle which panels you want to see when you enter Fullscreen mode.`
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
                                <AccordionContent className="text-base text-muted-foreground pl-12 whitespace-pre-line">
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