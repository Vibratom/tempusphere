
'use client';

import { DiagramEditor } from '@/components/projects/DiagramEditor';
import { Suspense } from 'react';

function SpreadsheetPageContent() {
  return <DiagramEditor />;
}

export default function SpreadsheetPage() {
  return (
    <Suspense>
      <SpreadsheetPageContent />
    </Suspense>
  );
}
