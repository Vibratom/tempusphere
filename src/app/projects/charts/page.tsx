
'use client';

import { Suspense } from 'react';
import { FlowchartView } from '@/components/projects/FlowchartView';


function ChartsPageContent() {
  return <FlowchartView />;
}

export default function ChartsPage() {
    return (
        <Suspense>
            <ChartsPageContent />
        </Suspense>
    )
}
