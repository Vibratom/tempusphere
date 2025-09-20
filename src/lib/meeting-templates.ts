
export interface MeetingTemplate {
    id: string;
    name: string;
    description: string;
}

export const meetingTemplates: MeetingTemplate[] = [
    {
        id: 'default',
        name: "Default Template",
        description: "A flexible, general-purpose template for any meeting type.",
    },
    {
        id: 'board-meeting',
        name: "Board Meeting",
        description: "A formal layout for board meetings, with sections for reports, voting, and discussion items.",
    },
    {
        id: 'annual-meeting',
        name: "Annual Meeting",
        description: "A formal template for annual meetings, covering reports, elections, and voting.",
    },
    {
        id: 'project-kick-off',
        name: "Project Kick-off",
        description: "A structured form for initiating a new project, covering goals, scope, and timeline.",
    },
    {
        id: 'daily-scrum',
        name: "Daily Stand-up / Scrum",
        description: "A quick format for daily team check-ins, focusing on progress and blockers.",
    },
    {
        id: 'one-on-one',
        name: "One-on-One",
        description: "A private meeting template for managers and direct reports to discuss progress and growth.",
    },
    {
        id: 'brainstorming',
        name: "Custom Template Builder",
        description: "An open canvas to build your own template with custom sections.",
    }
];

    