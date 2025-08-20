# **App Name**: Tempusphere

## Core Features:

- Primary Clock: Display a customizable primary clock with digital and analog modes, supporting local and UTC time, and adjustable display options (seconds, milliseconds, 12/24-hour formats).
- Secondary Clock: Show the time for a user-selected secondary time zone, dynamically updated and customizable.
- World Clocks: Enable users to add and manage multiple world clocks, displaying time for selected cities/time zones with user-defined preferences. Store state in local storage.
- Alarm System: Implement an alarm system allowing users to set alarms with customizable sounds, persisting alarm settings and triggering notifications. Alarm time should persist to localstorage
- Stopwatch: Provide a stopwatch feature with start, stop, lap, and reset functions, displaying time with high precision.
- Countdown Timer: Include a countdown timer where users can input a time, with start, stop, and reset controls, triggering an alarm on completion.
- Customization Features: Offer multiple preset themes and allow users to customize the clock's appearance with color pickers, font options, background images, and UI panel visibility toggles; Persist theme, font, color and other UI choices with local storage.

## Style Guidelines:

- Primary color: Soft blue (#749F82), evoking calmness and focus, ideal for prolonged screen viewing.
- Background color: Very light blue (#E1E7E4), close in hue to the primary, to ensure visual comfort during long usage.
- Accent color: Soft orange (#B3544B), which, due to being analogous to the primary color, highlights important elements such as the active time zone, or the start button of the timer, with balance and restraint.
- Body and headline font: 'Inter', a sans-serif typeface for a clean, neutral and very readable appearance, suiting an app with lots of quickly changing numbers and utility-driven user experience.
- A clean, modular layout with panels that can be toggled on/off to reduce visual clutter. Use a responsive design to adapt to different screen sizes.
- Use requestAnimationFrame for smooth analog clock hand movements and subtle transitions when switching between views.
- Utilize Lucide Icons for a consistent and clean look across all UI elements.