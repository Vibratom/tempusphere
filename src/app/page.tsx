
'use client';
import { LandingPage } from '@/components/tempusphere/LandingPage';
import { SettingsProvider } from '@/contexts/SettingsContext';

export default function Home() {
  return (
    <SettingsProvider>
      <LandingPage />
    </SettingsProvider>
  );
}
