
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';

interface PlatformLinkProps {
    name: string;
    category: string;
    icon: React.ComponentType<LucideProps>;
    href: string;
    color: string;
}

export function PlatformLink({ name, category, icon: Icon, href, color }: PlatformLinkProps) {
    const isExternal = href.startsWith('http');
    
    return (
        <Link href={href} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : ""}>
            <div className={cn(
                "group flex h-full flex-col items-center justify-center p-3 rounded-lg text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
                color
            )}>
                <Icon className="h-7 w-7 mb-1.5" />
                <span className="font-semibold text-base">{name}</span>
                <span className="text-xs opacity-80">{category}</span>
            </div>
        </Link>
    );
}
