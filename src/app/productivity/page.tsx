
'use client';

import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ProductivityProvider } from '@/contexts/ProductivityContext';

function ProductivityContent() {
    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Productivity Hub</h1>
                    <p className="text-muted-foreground mt-2">New design tool coming soon.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function ProductivityPage() {
    return (
        <SettingsProvider>
            <ProductivityProvider>
                <ProductivityContent />
            </ProductivityProvider>
        </SettingsProvider>
    );
}
