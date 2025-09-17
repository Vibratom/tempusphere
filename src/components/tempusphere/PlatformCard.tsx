import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
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
        <Card className="bg-card text-card-foreground h-full flex flex-col text-center items-center p-6 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="p-0 items-center">
                 <div className="bg-background/50 rounded-full p-3 mb-4">
                    <Image src={logo} alt={`${name} Logo`} width={48} height={48} />
                </div>
                <CardTitle className="tracking-tight font-headline text-2xl font-bold">{name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow pt-4">
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardContent>
            <CardFooter className="p-0 mt-6">
                 <Button asChild variant="outline">
                    <Link href={href} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : ""}>
                        Learn More
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
