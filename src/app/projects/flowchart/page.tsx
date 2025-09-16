'use client';

import { Suspense } from 'react';
import { FlowchartView } from '@/components/projects/FlowchartView';


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
