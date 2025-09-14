
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';

interface PlatformLinkProps {
    name: string;
    category: string;
    icon: React.ComponentType<LucideProps>;
    href: string;
    color: string;
    description: string;
}

export function PlatformLink({ name, category, icon: Icon, href, color, description }: PlatformLinkProps) {
    const isExternal = href.startsWith('http');
    
    return (
        <Link href={href} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : ""}>
            <div className={cn(
                "group flex h-full flex-col items-start p-4 rounded-lg text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
                color
            )}>
                <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-7 w-7" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-md">{name}</span>
                        <span className="text-xs opacity-80">{category}</span>
                    </div>
                </div>
                <p className="text-sm opacity-90">{description}</p>
            </div>
        </Link>
    );
}
