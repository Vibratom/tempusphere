'use client';

import { SpreadsheetView } from '@/components/projects/SpreadsheetView';
import { Suspense } from 'react';

function SpreadsheetPageContent() {
  return <SpreadsheetView />;
}

export default function SpreadsheetPage() {
  return (
    <Suspense>
      <SpreadsheetPageContent />
    </Suspense>
  );
}
