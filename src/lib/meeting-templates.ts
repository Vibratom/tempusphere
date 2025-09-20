
export interface MeetingTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
}

export const meetingTemplates: MeetingTemplate[] = [
    {
        id: 'default',
        name: "Default Template",
        description: "A flexible, general-purpose template for any meeting type.",
        content: ""
    },
    {
        id: 'board-meeting',
        name: "Board Meeting",
        description: "A formal layout for board meetings, with sections for reports, voting, and discussion items.",
        content: "" // Content is now handled by the component layout
    },
    {
        id: 'annual-meeting',
        name: "Annual Meeting",
        description: "A formal template for annual meetings, covering reports, elections, and voting.",
        content: "" // Content is now handled by the component layout
    },
    {
        id: 'project-kick-off',
        name: "Project Kick-off",
        description: "A standard template for initiating a new project.",
        content: `### 1. Project Goals & Objectives
- 

### 2. Scope & Deliverables
- In Scope: 
- Out of Scope: 

### 3. Timeline & Key Milestones
- Milestone 1: 
- Milestone 2: 

### 4. Roles & Responsibilities
- 

### 5. Risks & Mitigation
- 

### 6. Open Questions
- `
    },
    {
        id: 'daily-scrum',
        name: "Daily Stand-up / Scrum",
        description: "A quick format for daily team check-ins.",
        content: `### Updates
- **(Team Member 1):**
  - Yesterday: 
  - Today: 
  - Blockers: 
- **(Team Member 2):**
  - Yesterday: 
  - Today: 
  - Blockers: `
    },
    {
        id: 'client-check-in',
        name: "Client Check-in",
        description: "For regular updates and feedback sessions with a client.",
        content: `### 1. Review of Previous Action Items
- 

### 2. Progress Update & Demo
- 

### 3. Client Feedback
- 

### 4. Next Steps & Priorities
- `
    },
    {
        id: 'one-on-one',
        name: "One-on-One",
        description: "A private meeting between a manager and a direct report.",
        content: `### 1. Check-in & How are you doing?
- 

### 2. Review of Priorities & Goals
- 

### 3. Challenges & Blockers
- 

### 4. Career Growth & Development
- 

### 5. Feedback (Both ways)
- `
    },
    {
        id: 'brainstorming',
        name: "Brainstorming Session",
        description: "An open format for generating new ideas.",
        content: `### Problem Statement / Goal
- 

### Idea Generation (Round 1)
- 

### Idea Generation (Round 2)
- 

### Idea Grouping & Theming
- Theme 1: 
- Theme 2: 

### Prioritized Ideas
1. 
2. 
3. `
    }
];
