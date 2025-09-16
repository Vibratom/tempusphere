
'use client';

import { Suspense } from 'react';
import { CanvasView } from '@/components/projects/CanvasView';


function ChartsPageContent() {
  return <CanvasView />;
}

export default function ChartsPage() {
    return (
        <Suspense>
            <ChartsPageContent />
        </Suspense>
    )
}
