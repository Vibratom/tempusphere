
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Globe, AlarmClock, Hourglass, Timer, Users, Scale, CalendarDays, ListChecks, KanbanSquare, Briefcase, Landmark, UtensilsCrossed, TrendingUp, BrainCircuit, IterationCw, Megaphone, FileText } from 'lucide-react';

const timeFeatures = [
    { icon: Clock, title: 'Customizable Primary Clock' },
    { icon: Globe, title: 'World Clock Dashboard' },
    { icon: AlarmClock, title: 'Alarm System' },
    { icon: Hourglass, title: 'Precision Stopwatch' },
    { icon: Timer, title: 'Countdown Timer' },
    { icon: Scale, title: 'Timezone Converter' },
    { icon: Users, title: 'Conference Planner' },
];

const organizationFeatures = [
    { icon: CalendarDays, title: 'Personal Calendar' },
    { icon: ListChecks, title: 'Advanced Checklist' },
    { icon: UtensilsCrossed, title: 'Recipe Cookbook' },
]

const projectFeatures = [
    { icon: KanbanSquare, title: 'Project Management Suite' },
    { icon: Landmark, title: 'Project Bookkeeping' },
];

const productivityFeatures = [
    { icon: Briefcase, title: 'Productivity Suite' },
    { icon: TrendingUp, title: 'Win/Loss Analysis' },
    { icon: BrainCircuit, title: 'Strategic Analysis Tools' },
    { icon: IterationCw, title: 'Customer Lifecycle Management' },
    { icon: Megaphone, title: 'Marketing Strategy Planners' },
    { icon: FileText, title: 'Meeting Minutes Generator' },
];

const FeatureSection = ({ title, features }: { title: string, features: {icon: React.ElementType, title: string}[]}) => (
    <>
        <h3 className="text-2xl font-semibold">{title}</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
            {features.map((feature) => (
                <li key={feature.title} className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="font-medium">{feature.title}</span>
                </li>
            ))}
        </ul>
    </>
);


export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl">About Tempusphere</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-lg space-y-6">
              <p>
                Welcome to Tempusphere, your all-in-one solution for mastering time and productivity. In today's fast-paced world, managing your time, projects, and strategies effectively is more crucial than ever. Tempusphere was born from a simple idea: to create a single, beautifully designed, and highly functional dashboard that brings all your essential tools into one place.
              </p>
              <p>
                Whether you're a remote worker coordinating with a global team, a business analyst driving strategy, a project manager juggling deadlines, or simply someone who loves to stay organized, Tempusphere is designed for you. Our goal is to provide a seamless and intuitive experience that helps you stay productive, punctual, and prepared.
              </p>
              
              <FeatureSection title="Core Time Management" features={timeFeatures} />
              <FeatureSection title="Personal Organization" features={organizationFeatures} />
              <FeatureSection title="Project Management" features={projectFeatures} />
              <FeatureSection title="Productivity & Strategy" features={productivityFeatures} />

              <h3 className="text-2xl font-semibold">Our Philosophy</h3>
              <p>
                We believe that good software should be powerful yet simple. It should work for you, not against you. That's why every feature in Tempusphere is built with three principles in mind:
              </p>
              <ul>
                <li><strong>Functionality:</strong> Each tool is designed to be robust and reliable, giving you the power you need to manage your day.</li>
                <li><strong>Usability:</strong> A clean, intuitive interface that's easy to navigate. All your data is stored locally in your browser, ensuring privacy and speed.</li>
                <li><strong>Customization:</strong> Your tools should look and feel the way you want. Tempusphere offers extensive theme and layout options to create your perfect dashboard.</li>
              </ul>
              <p>
                Thank you for choosing Tempusphere. We're constantly working to improve and add new features, and we're excited to have you on this journey with us.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
