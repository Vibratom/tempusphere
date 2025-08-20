
import { Button } from "@/components/ui/button";
import { Github, Twitter, Mail } from "lucide-react";
import { AppLogo } from "./AppLogo";

const socialLinks = [
    { name: 'Github', icon: Github, href: 'https://github.com/firebase/studio-content-tempusphere' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Email', icon: Mail, href: 'mailto:tempusphere@example.com' },
]

export function Footer() {
    return (
        <footer className="bg-background border-t w-full mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                    <AppLogo className="h-5 w-5"/>
                    <p className="text-sm">&copy; {new Date().getFullYear()} Tempusphere. All rights reserved.</p>
                </div>
                <div className="flex items-center space-x-4">
                    {socialLinks.map(link => (
                         <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <link.icon className="h-5 w-5" />
                            <span className="sr-only">{link.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
