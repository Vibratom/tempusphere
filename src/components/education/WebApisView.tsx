
'use client';

import { Card } from '../ui/card';
import { DictionaryApp } from './DictionaryApp';
import { CountryExplorer } from './CountryExplorer';
import { ApodViewer } from './ApodViewer';
import { HistoricalEvents } from './HistoricalEvents';

export function WebApisView() {
    return (
        <div className="space-y-8">
            <Card>
                <DictionaryApp />
            </Card>
            <Card>
                <CountryExplorer />
            </Card>
            <Card>
                <ApodViewer />
            </Card>
            <Card>
                <HistoricalEvents />
            </Card>
        </div>
    )
}
