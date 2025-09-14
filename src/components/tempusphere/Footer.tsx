
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">

                <section className="mb-12">
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

                <section>
                    <h3 className="text-2xl font-semibold text-white mb-2">Have a feature request or suggestion?</h3>
                    <p className="text-gray-400 mb-4">We'd love to hear from you!</p>
                    <a href="mailto:simplysub@vibratomstudios.com" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <Mail className="h-5 w-5" />
                        simplysub@vibratomstudios.com
                    </a>
                </section>
            </div>
        </footer>
    );
}
