'use client';

import { FlowchartView } from '@/components/projects/FlowchartView';
import { Suspense } from 'react';

function CanvasPageContent() {
  return <FlowchartView />;
}

export default function CanvasPage() {
    return (
        <Suspense>
            <CanvasPageContent />
        </Suspense>
    )
}
