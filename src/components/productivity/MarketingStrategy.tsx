
'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowBigRight, ArrowRight, Book, Bot, BrainCircuit, Building, Calendar, ChevronsRight, CircleDollarSign, Clapperboard, Code, Contact, Handshake, Heart, Home, Images, Info, Landmark, Link, Mail, Megaphone, MessageSquare, Mic, Newspaper, Pin, Repeat, Rocket, Rss, Search, Send, Settings, ShoppingCart, Smartphone, Star, Tablet, ThumbsUp, Ticket, User, UserPlus, Users, Video, Wallet, Wand2, Workflow, Youtube } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';


interface StrategyItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface StrategySubGroup {
    title?: string;
    items: StrategyItem[];
}

interface StrategyGroup {
    title: string;
    groups: StrategySubGroup[];
}

const marketingData: StrategyGroup[] = [
    {
        title: 'Acquisition Channels',
        groups: [
            {
                title: 'Back Links & PR',
                items: [
                    { id: 'influencers', label: 'Influencers', icon: Star },
                    { id: 'news-press', label: 'News & Press', icon: Newspaper },
                    { id: 'podcast-interviews', label: 'Podcast Interviews', icon: Mic },
                    { id: 'jvs', label: 'Joint Ventures (JVs)', icon: Handshake },
                    { id: 'newsjacking', label: 'Newsjacking', icon: Megaphone },
                    { id: 'sponsorships', label: 'Sponsorships', icon: CircleDollarSign },
                    { id: 'guest-blogs', label: 'Guest Blogs', icon: UserPlus },
                    { id: 'roundup-posts', label: 'Roundup Posts', icon: Rss },
                    { id: 'testimonials', label: 'Testimonials', icon: ThumbsUp },
                    { id: 'blogs-link', label: 'Blogs', icon: Rss },
                    { id: 'sponsored-posts', label: 'Sponsored Posts', icon: Megaphone },
                    { id: 'infographics', label: 'Infographics', icon: Images },
                    { id: 'events-link', label: 'Events', icon: Calendar },
                    { id: 'reddit', label: 'Reddit', icon: Bot },
                    { id: 'quora', label: 'Quora', icon: Info },
                    { id: 'wikipedia', label: 'Wikipedia', icon: Book },
                    { id: 'photos-images', label: 'Photos and Images', icon: Images },
                    { id: 'books', label: 'Books', icon: Book },
                ]
            },
        ]
    },
    {
        title: 'Core Strategy',
        groups: [
            {
                title: 'Search & AI',
                items: [
                    { id: 'seo', label: 'SEO', icon: Search },
                    { id: 'sem', label: 'SEM', icon: Landmark },
                    { id: 'chatbots', label: 'Chatbots (AI)', icon: Bot },
                ]
            },
            {
                title: 'Website',
                items: [
                    { id: 'website', label: 'Website', icon: Home },
                    { id: 'mobile-friendly', label: 'Mobile & Tablet Friendly Site', icon: Smartphone },
                    { id: 'landing-pages', label: 'Landing Pages', icon: Tablet },
                ]
            },
            {
                title: 'Social Media & Content Marketing',
                items: [
                    { id: 'blog', label: 'Blog', icon: Rss },
                    { id: 'youtube', label: 'YouTube', icon: Youtube },
                    { id: 'email', label: 'Email Marketing', icon: Mail },
                    { id: 'virtual-events', label: 'Virtual Events', icon: Video },
                    { id: 'pinterest', label: 'Pinterest', icon: Pin },
                    { id: 'tiktok', label: 'TikTok', icon: Clapperboard },
                    { id: 'medium', label: 'Medium', icon: Book },
                    { id: 'apps', label: 'Apps', icon: Smartphone },
                    { id: 'podcasts', label: 'Podcasts', icon: Mic },
                    { id: 'x', label: 'X', icon: Code },
                    { id: 'instagram', label: 'Instagram', icon: Clapperboard },
                    { id: 'linkedin', label: 'LinkedIn', icon: Users },
                    { id: 'facebook', label: 'Facebook', icon: ThumbsUp },
                ]
            }
        ]
    },
    {
        title: 'Outcomes',
        groups: [
            {
                title: 'Purchase',
                items: [
                    { id: 'buy', label: 'Buy', icon: ShoppingCart },
                    { id: 'upsell', label: 'Upsell', icon: Repeat },
                    { id: 'paid-subscription', label: 'Paid Subscription', icon: Wallet },
                    { id: 'online-training', label: 'Online Training Program', icon: Clapperboard },
                ]
            },
            {
                title: 'Enquire',
                items: [
                    { id: 'contact-us', label: 'Contact Us', icon: Contact },
                    { id: 'phone', label: 'Phone', icon: Smartphone },
                    { id: 'book-call', label: 'Book a Call', icon: Calendar },
                    { id: 'email-us', label: 'Email Us', icon: Mail },
                ]
            },
            {
                title: 'Connect',
                items: [
                    { id: 'subscribe', label: 'Subscribe to Email Newsletter', icon: Send },
                    { id: 'autoresponder', label: 'Marketing Funnel / Email Autoresponder', icon: Workflow },
                    { id: 'workshops', label: 'Virtual Events or Workshops', icon: Video },
                    { id: 'messenger-bots', label: 'Social Media or Messenger Bots', icon: Bot },
                ]
            },
            {
                title: 'Free Download',
                items: [
                    { id: 'unique-content', label: 'Unique Content', icon: Wand2 },
                    { id: 'lead-magnet', label: 'Lead Magnet', icon: Link },
                    { id: 'giveaway', label: 'Valuable Giveaway', icon: Star },
                    { id: 'templates', label: 'Templates', icon: Rss },
                    { id: 'ebooks', label: 'E-books', icon: Book },
                ]
            },
        ]
    },
];

const ItemCheckbox = ({ id, label, icon: Icon, isChecked, onToggle }: { id: string, label: string, icon: React.ElementType, isChecked: boolean, onToggle: (id: string) => void }) => {
    return (
        <div className="flex items-center space-x-2">
            <Checkbox id={id} checked={isChecked} onCheckedChange={() => onToggle(id)} />
            <Label htmlFor={id} className="text-sm font-normal flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
            </Label>
        </div>
    );
};


export function MarketingStrategy() {
    const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, boolean>>('marketing-strategy:checked-v1', {});

    const toggleItem = (id: string) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Marketing Strategy</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    An interactive checklist based on the Web Strategy Planning Template to guide your marketing efforts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column */}
                <div className="lg:col-span-3 space-y-4">
                    {marketingData.find(g => g.title === 'Acquisition Channels')?.groups.map(subGroup => (
                        <Card key={subGroup.title}>
                            <CardHeader>
                                <CardTitle>{subGroup.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {subGroup.items.map(item => (
                                    <ItemCheckbox key={item.id} {...item} isChecked={!!checkedItems[item.id]} onToggle={toggleItem} />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Center Column */}
                <div className="lg:col-span-6 space-y-4">
                    {marketingData.find(g => g.title === 'Core Strategy')?.groups.map(subGroup => (
                        <Card key={subGroup.title} className={cn(subGroup.title === 'Website' && 'border-primary border-2')}>
                            <CardHeader>
                                <CardTitle>{subGroup.title}</CardTitle>
                            </CardHeader>
                            <CardContent className={cn("space-y-3", subGroup.title === 'Social Media & Content Marketing' && 'grid grid-cols-2 gap-3')}>
                                {subGroup.items.map(item => (
                                    <ItemCheckbox key={item.id} {...item} isChecked={!!checkedItems[item.id]} onToggle={toggleItem} />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="text-center bg-muted/30">
                        <CardContent className="p-6">
                            <p className="font-bold text-5xl tracking-widest text-primary/50">TRUST</p>
                        </CardContent>
                    </Card>
                     {marketingData.find(g => g.title === 'Outcomes')?.groups.map(subGroup => (
                        <Card key={subGroup.title}>
                            <CardHeader>
                                <CardTitle>{subGroup.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {subGroup.items.map(item => (
                                    <ItemCheckbox key={item.id} {...item} isChecked={!!checkedItems[item.id]} onToggle={toggleItem} />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        </div>
    );
}

    