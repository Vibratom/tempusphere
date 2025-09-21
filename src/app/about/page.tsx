
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Clock, Globe, AlarmClock, Hourglass, Timer, Users, Scale, CalendarDays, ListChecks, KanbanSquare, Briefcase, Landmark, UtensilsCrossed, TrendingUp, BrainCircuit, IterationCw, Megaphone, FileText, GanttChart, List, Brain, DraftingCompass, Table, BarChartHorizontal, Calculator, Percent, BookOpen, Inbox, Workflow } from 'lucide-react';

const timeFeatures = [
    { icon: Clock, title: 'Customizable Primary Clock', description: 'Choose between a classic analog or modern digital display. Supports local time, UTC, and extensive theme customization to match your style.' },
    { icon: Globe, title: 'World Clock Dashboard', description: 'Keep track of multiple timezones at once. Perfect for coordinating with international teams and staying connected with friends and family worldwide.' },
    { icon: AlarmClock, title: 'Alarm System', description: 'Set multiple, reliable alarms with custom names and a variety of sounds to ensure you never miss an important event.' },
    { icon: Hourglass, title: 'Precision Stopwatch', description: 'A high-precision stopwatch with start, stop, lap, and reset functions, designed for accuracy in any timing task.' },
    { icon: Timer, title: 'Countdown Timer', description: 'Set a countdown for any duration. A clear alarm sounds when time is up, making it perfect for workouts, cooking, or focused work sessions.' },
    { icon: Scale, title: 'Timezone Converter', description: 'Effortlessly convert any date and time across multiple timezones simultaneously to simplify scheduling and planning.' },
    { icon: Users, title: 'Conference Planner', description: 'Find ideal meeting times across several timezones by automatically identifying overlapping business hours for all participants.' },
];

const organizationFeatures = [
    { icon: CalendarDays, title: 'Personal Calendar', description: 'A comprehensive event management tool. Keep track of your appointments, deadlines, and important dates with a clear and intuitive interface.' },
    { icon: ListChecks, title: 'Advanced Checklist', description: 'A powerful to-do list manager with support for sub-tasks, recurring tasks, due dates, priorities, and seamless calendar integration.' },
    { icon: BookOpen, title: 'Digital Recipe Book', description: 'A personal or shared app to store, organize, and search for recipes. This is a great starter project to learn how to handle data (adding, viewing, editing, deleting recipes).' },
    { icon: Inbox, title: 'Inventory Manager', description: 'A tool to keep track of all your ingredients. You can add items, update quantities as you use them, and set alerts for when an ingredient is running low.' },
];

const culinaryFeatures = [
    { icon: Calculator, title: 'Food Cost Calculator', description: 'A tool where you can input the price of each ingredient in a recipe to automatically calculate the total cost of the dish and the cost per serving.' },
    { icon: Percent, title: 'Yield Percentage Converter', description: 'This app helps you scale a recipe up or down. You can enter the original yield and the new desired yield, and the app will calculate the new ingredient quantities for you.' },
    { icon: Scale, title: 'Unit Conversion Tool', description: 'A simple but vital app that converts measurements (e.g., grams to ounces, teaspoons to milliliters). This is perfect for learning about basic forms and calculations.' },
];

const culinaryWorkflowFeatures = [
    { icon: Timer, title: 'Kitchen Timer Station', description: 'A single-page app with multiple independent timers. A chef can start a timer for their pasta, another for their sauce, and a third for the bread, all on one screen.' },
    { icon: ListChecks, title: 'Recipe Preparation Checklist', description: 'An interactive checklist for a specific recipe. As you complete a step (e.g., "chop onions"), you can check it off, helping you stay on track and ensure you don\'t miss anything.' },
    { icon: KanbanSquare, title: 'Kitchen Display System (KDS) Light', description: 'A simplified version of a KDS. It would show incoming orders from a text field and use color coding (e.g., green for new, yellow for in progress, red for delayed) to help prioritize.' },
];


const projectFeatures = [
    { icon: KanbanSquare, title: 'Kanban Board', description: 'Visualize your project workflow with a flexible Kanban board. Drag and drop tasks between columns to track progress from "To Do" to "Done".' },
    { icon: List, title: 'Task List View', description: 'See all your project tasks in a single, sortable, and filterable table. A powerful way to get a high-level overview of your entire project.'},
    { icon: GanttChart, title: 'Gantt Chart', description: 'Visualize your project timeline with an interactive Gantt chart. See task dependencies and durations to manage your schedule effectively.'},
    { icon: Landmark, title: 'Project Bookkeeping', description: 'Track project-specific income and expenses. Link financial transactions directly to tasks to monitor the financial health of your projects.' },
    { icon: Table, title: 'Spreadsheet', description: 'A lightweight, integrated spreadsheet tool for project data management, calculations, and quick tabular notes.'},
    { icon: Brain, title: 'Mind Map Creator', description: 'Organize your ideas visually with a simple, text-based mind mapping tool. Perfect for brainstorming sessions and structuring complex thoughts.'},
    { icon: DraftingCompass, title: 'Canvas', description: 'A freeform design canvas for creating diagrams, mockups, or any visual aid your project requires. Supports text, drawing, and image uploads.'},
    { icon: BarChartHorizontal, title: 'Chart Editor', description: 'Create and customize various types of charts and diagrams using a simple visual editor or by writing Mermaid syntax for more complex visualizations.'},
];

const productivityFeatures = [
    { icon: TrendingUp, title: 'Win/Loss Analysis', description: 'Analyze your sales outcomes to identify trends, understand why you win or lose deals, and refine your sales strategy for better results.' },
    { icon: BrainCircuit, title: 'Strategic Analysis Tools', description: 'A suite of classic strategic frameworks like SWOT, PESTLE, and Porter\'s Five Forces to analyze your business and market landscape.' },
    { icon: IterationCw, title: 'Customer Lifecycle Management', description: 'Map and optimize every stage of the customer journey, from awareness to advocacy, to build stronger and more profitable customer relationships.' },
    { icon: Megaphone, title: 'Marketing Strategy Planners', description: 'Utilize frameworks like the Marketing Mix (4 Ps) and Hero/Hub/Help to build comprehensive, persona-driven marketing plans.' },
    { icon: FileText, title: 'Meeting Minutes Generator', description: 'Choose from a variety of templates (Board Meeting, Daily Scrum, etc.) to efficiently capture notes, decisions, and action items from your meetings.' },
];

const FeatureSection = ({ title, features }: { title: string, features: {icon: React.ElementType, title: string, description: string}[]}) => (
    <div className="space-y-6">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
            ))}
        </div>
    </div>
);


export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Card className="shadow-lg">
            <CardHeader className="text-center p-8">
              <CardTitle className="text-4xl md:text-5xl font-bold tracking-tighter">About Tempusphere</CardTitle>
              <CardDescription className="text-lg md:text-xl max-w-3xl mx-auto pt-2">
                Your Unified Dashboard for Productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-lg space-y-12 px-4 md:px-8 pb-12">
              <div className="text-center max-w-4xl mx-auto">
                <p>
                  Tempusphere is more than just a collection of tools; it's a unified dashboard designed to bring clarity and control to your daily life. In a world that constantly demands more of your time and attention, we provide a single, elegant space to manage everything from your schedule and projects to your finances and creative ideas.
                </p>
                <p>
                  Our philosophy is simple: empower you with robust, intuitive tools that work for you, not against you. All your data is stored locally in your browser, ensuring your privacy and providing a fast, responsive experience. From the individual professional managing global meetings to the business analyst steering corporate strategy, Tempusphere adapts to your needs. Welcome to your new center of productivity.
                </p>
              </div>
              
              <FeatureSection title="Core Time Management" features={timeFeatures} />
              <FeatureSection title="Personal Organization" features={organizationFeatures} />
              <FeatureSection title="Culinary Calculators" features={culinaryFeatures} />
              <FeatureSection title="Culinary Workflow & Communication" features={culinaryWorkflowFeatures} />
              <FeatureSection title="Project Management" features={projectFeatures} />
              <FeatureSection title="Productivity & Strategy" features={productivityFeatures} />

              <div className="text-center pt-8">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Our Philosophy</h3>
                  <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-6">
                      <div className="p-4">
                          <h4 className="font-semibold text-xl mb-2">Functionality</h4>
                          <p className="text-muted-foreground">Each tool is designed to be robust and reliable, giving you the power you need to manage your day.</p>
                      </div>
                      <div className="p-4">
                          <h4 className="font-semibold text-xl mb-2">Privacy-First</h4>
                          <p className="text-muted-foreground">All your data is stored locally in your browser, ensuring privacy, speed, and offline access.</p>
                      </div>
                      <div className="p-4">
                          <h4 className="font-semibold text-xl mb-2">Customization</h4>
                          <p className="text-muted-foreground">Your tools should look and feel the way you want. Tempusphere offers extensive theme and layout options.</p>
                      </div>
                  </div>
                   <p className="mt-8">
                    Thank you for choosing Tempusphere. We're constantly working to improve and add new features, and we're excited to have you on this journey with us.
                  </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
