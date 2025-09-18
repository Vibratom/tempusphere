
'use client';

import { Card } from '../ui/card';
import { EducationEditor } from './EducationEditor';

export function EducationStudioView() {
    return (
        <div className="space-y-8">
            <Card>
                <EducationEditor />
            </Card>
        </div>
    )
}
