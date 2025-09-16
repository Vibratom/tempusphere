'use client';

import { Suspense } from 'react';
import { DiagramEditor } from '@/components/projects/DiagramEditor';


function ChartsPageContent() {
  return <DiagramEditor />;
}

export default function ChartsPage() {
    return (
        <Suspense>
            <ChartsPageContent />
        </Suspense>
    )
}
