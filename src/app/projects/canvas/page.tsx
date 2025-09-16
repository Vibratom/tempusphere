
'use client';

import { CanvasView } from '@/components/projects/CanvasView';
import { Suspense } from 'react';

function CanvasPageContent() {
  return <CanvasView />;
}

export default function CanvasPage() {
    return (
        <Suspense>
            <CanvasPageContent />
        </Suspense>
    )
}
