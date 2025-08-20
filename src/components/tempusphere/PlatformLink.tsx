
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
                "group flex items-center justify-between p-4 rounded-lg text-white transition-all duration-300 transform hover:scale-105",
                color
            )}>
                <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <span className="font-semibold">{name}</span>
                    <span className="text-sm opacity-80">({category})</span>
                </div>
            </div>
        </Link>
    );
}
