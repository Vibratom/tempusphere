'use client';

import { Card } from '../ui/card';
import { LanguageTools } from './LanguageTools';

export function WebApisView() {
    return (
        <div className="space-y-8">
            <Card>
                <LanguageTools />
            </Card>
        </div>
    )
}
