import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppLogo } from "./AppLogo";
import { Calculator, Music, Wind, BookOpen, Clock, Youtube, Subtitles, Twitter, Facebook, Instagram, Github, Mail } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const platforms = [
    { name: 'Axiom (Calculators)', icon: Calculator, href: '#', style: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Cadence (Music)', icon: Music, href: '#', style: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'Lumina (Blog)', icon: BookOpen, href: '#', style: 'bg-green-500 hover:bg-green-600' },
    { name: 'NexusPlay (Games)', icon: Youtube, href: '#', style: 'bg-red-500 hover:bg-red-600' },
    { name: 'Stillpoint (Meditation)', icon: Wind, href: '#', style: 'bg-yellow-500 hover:bg-yellow-600' },
    { name: 'Uniform (Converters)', icon: Subtitles, href: '#', style: 'bg-cyan-500 hover:bg-cyan-600' },
    { name: 'Tempusphere (Clock)', icon: Clock, href: '#', style: 'bg-orange-500 hover:bg-orange-600' },
    { name: 'SimplySub (Subtitles)', icon: Subtitles, href: '#', style: 'bg-pink-500 hover:bg-pink-600' },
];

const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Github', icon: Github, href: '#' },
]

export function Footer() {
    const { layout } = useSettings();
    if (layout === 'sidebar-left' || layout === 'sidebar-right') {
        return null;
    }
    
    return (
        <footer className="bg-background border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-muted-foreground">
                <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-2 text-foreground">About Vibratom Studios & Our Platforms</h3>
                    <p className="max-w-2xl mx-auto mb-4">
                        Vibratom Studios is a comprehensive digital ecosystem designed to enhance your creative and productive life.
                        Explore our other specialized platforms:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
                        {platforms.map(platform => (
                            <Button key={platform.name} asChild className={platform.style}>
                                <a href={platform.href} target="_blank" rel="noopener noreferrer">
                                    <platform.icon className="mr-2 h-4 w-4" />
                                    {platform.name}
                                </a>
                            </Button>
                        ))}
                    </div>
                    <p>Visit our main site at <a href="https://vibratomstudios.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vibratomstudios.com</a></p>
                </div>
                <Separator className="my-8" />
                <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-2 text-foreground">Have a feature request or suggestion?</h4>
                    <p className="mb-2">We'd love to hear from you!</p>
                    <a href="mailto:tempusphere@vibratomstudios.com" className="inline-flex items-center text-primary hover:underline">
                        <Mail className="mr-2 h-4 w-4" />
                        tempusphere@vibratomstudios.com
                    </a>
                </div>
                <div className="flex justify-center items-center space-x-4">
                    {socialLinks.map(link => (
                         <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <link.icon className="h-5 w-5" />
                            <span className="sr-only">{link.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
