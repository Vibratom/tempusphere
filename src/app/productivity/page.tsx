
'use client';

import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense } from 'react';
import { ProductivityProvider } from '@/contexts/ProductivityContext';
import { HabitTracker } from '@/components/productivity/HabitTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformLink } from '@/components/tempusphere/PlatformLink';
import { DraftingCompass } from 'lucide-react';

function ProductivityContent() {
  const otherTools = [
    { name: 'Canvas', category: 'Whiteboard', icon: DraftingCompass, href: '/projects/canvas', color: 'bg-sky-500 hover:bg-sky-600', description: 'Collaborate visually with a digital whiteboard.' },
  ];

  return (
    <SettingsProvider>
      <ProductivityProvider>
        <div className="min-h-screen w-full bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col items-center p-4 md:p-8 gap-8">
              <HabitTracker />
              <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Other Productivity Tools</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {otherTools.map(p => <PlatformLink key={p.name} {...p} />)}
                    </div>
                </CardContent>
              </Card>
          </main>
          <Footer />
        </div>
      </ProductivityProvider>
    </SettingsProvider>
  )
}

export default function ProductivityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductivityContent />
    </Suspense>
  );
}
