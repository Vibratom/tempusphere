
'use client';

import { Suspense } from 'react';
import { CanvasView } from '@/components/projects/CanvasView';


function FlowchartPageContent() {
  return <CanvasView />;
}

export default function FlowchartPage() {
    return (
        <Suspense>
            <FlowchartPageContent />
        </Suspense>
    )
}
