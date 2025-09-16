
'use client';

import { FlowchartView } from '@/components/projects/FlowchartView';
import { Suspense } from 'react';

function FlowchartPageContent() {
  return <FlowchartView />;
}

export default function FlowchartPage() {
    return (
        <Suspense>
            <FlowchartPageContent />
        </Suspense>
    )
}
