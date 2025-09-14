
'use client';

import { TempusphereLayout } from '@/components/tempusphere/TempusphereLayout';
import { CalendarProvider } from '@/contexts/CalendarContext';

export default function AppPage() {
  return (
    <CalendarProvider>
      <TempusphereLayout />
    </CalendarProvider>
  );
}
