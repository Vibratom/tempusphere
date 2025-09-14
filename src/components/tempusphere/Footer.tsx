
'use client';

import { Calculator, Music, PenSquare, Gamepad2, Leaf, Combine, Clock, Mail } from "lucide-react";
import Link from "next/link";
import { PlatformLink } from "./PlatformLink";

const vibratomPlatforms = [
    { name: 'Axiom', category: 'Calculators', icon: Calculator, href: 'https://axiom.vibratomstudios.com', color: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Cadence', category: 'Music', icon: Music, href: 'https://cadence.vibratomstudios.com', color: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'Lumina', category: 'Blog', icon: PenSquare, href: 'https://lumina.vibratomstudios.com/?team=Tempusphere', color: 'bg-green-500 hover:bg-green-600' },
    { name: 'NexusPlay', category: 'Games', icon: Gamepad2, href: 'https://nexusplay.vibratomstudios.com', color: 'bg-red-500 hover:bg-red-600' },
    { name: 'Stillpoint', category: 'Meditation', icon: Leaf, href: 'https://stillpoint.vibratomstudios.com', color: 'bg-teal-500 hover:bg-teal-600' },
    { name: 'Uniform', category: 'Converters', icon: Combine, href: 'https://uniform.vibratomstudios.com', color: 'bg-cyan-500 hover:bg-cyan-600' },
    { name: 'Tempusphere', category: 'Clock', icon: Clock, href: '/', color: 'bg-orange-500 hover:bg-orange-600' },
];

export function Footer() {
    return (
        <footer className="bg-[#101319] text-gray-300 w-full mt-auto py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                <section className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">Explore the Vibratom Studios Ecosystem</h2>
                    <p className="max-w-3xl mx-auto text-lg text-gray-400 mb-6">
                        Vibratom Studios is a comprehensive digital ecosystem designed to enhance every aspect of your creative and productive life.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-5xl mx-auto">
                        {vibratomPlatforms.map(p => <PlatformLink key={p.name} {...p} />)}
                    </div>
                     <Link href="https://www.vibratomstudios.com" target="_blank" rel="noopener noreferrer" className="text-lg text-pink-400 hover:text-pink-300 hover:underline mt-6 inline-block">
                        Visit our main site at VibratomStudios.com
                    </Link>
                </section>
                
                <hr className="border-gray-700 mb-10" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div className="space-y-4">
                         <h3 className="text-xl font-semibold text-white">Tempusphere</h3>
                         <p className="text-gray-400">Your all-in-one solution for time management. Built with privacy and customization in mind.</p>
                         <div className="flex justify-center md:justify-start space-x-4 text-gray-400">
                             <Link href="/about" className="hover:text-white">About Us</Link>
                             <Link href="/contact" className="hover:text-white">Contact</Link>
                             <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                         </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Have a feature request?</h3>
                        <p className="text-gray-400">We'd love to hear from you! Email us with your ideas to help make Tempusphere even better.</p>
                    </div>
                    <div className="space-y-4 flex flex-col items-center md:items-end">
                        <h3 className="text-xl font-semibold text-white">Get in Touch</h3>
                        <a href="mailto:simplysub@vibratomstudios.com" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            <Mail className="h-5 w-5" />
                            simplysub@vibratomstudios.com
                        </a>
                    </div>
                </div>

                 <div className="text-center text-gray-500 pt-10 mt-10 border-t border-gray-700">
                    <p>&copy; {new Date().getFullYear()} Vibratom Studios. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
