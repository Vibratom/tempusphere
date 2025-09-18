'use client';

import { Card } from '../ui/card';
import { ChartEditor } from '../projects/ChartEditor';

export function EducationStudioView() {
    return (
        <div className="space-y-8">
            <Card>
                <ChartEditor />
            </Card>
        </div>
    )
}
