
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
        <footer className="bg-background border-t w-full mt-auto py-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-muted-foreground gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <AppLogo className="h-5 w-5"/>
                    <span>&copy; {new Date().getFullYear()} Tempusphere. All rights reserved.</span>
                </div>
                <div className="flex items-center space-x-2">
                    {socialLinks.map(link => (
                         <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted">
                            <link.icon className="h-5 w-5" />
                            <span className="sr-only">{link.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
