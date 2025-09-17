
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import Image from 'next/image';

interface PlatformCardProps {
    name: string;
    description: string;
    logo: string;
    href: string;
}

export function PlatformCard({ name, description, logo, href }: PlatformCardProps) {
    const isExternal = href.startsWith('http');
    
    return (
        <Link 
            href={href} 
            target={isExternal ? "_blank" : "_self"} 
            rel={isExternal ? "noopener noreferrer" : ""}
            className="group"
        >
            <Card className="bg-[#1C2028] text-white h-full flex flex-col text-center items-center p-4 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:-translate-y-1">
                <CardHeader className="p-0 items-center">
                     <div className="bg-gray-700/50 rounded-full p-2 mb-3">
                        <Image src={logo} alt={`${name} Logo`} width={32} height={32} />
                    </div>
                    <CardTitle className="tracking-tight font-headline text-lg font-bold">{name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow pt-2">
                    <CardDescription className="text-gray-400 text-sm">{description}</CardDescription>
                </CardContent>
            </Card>
        </Link>
    );
}
