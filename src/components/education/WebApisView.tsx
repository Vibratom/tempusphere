
'use client';

import { Card } from '../ui/card';
import { DictionaryApp } from './DictionaryApp';
import { CountryExplorer } from './CountryExplorer';
import { HistoricalEvents } from './HistoricalEvents';
import { TranslatorApp } from './TranslatorApp';

export function WebApisView() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card>
                    <DictionaryApp />
                </Card>
                <Card>
                    <TranslatorApp />
                </Card>
            </div>
            <Card>
                <CountryExplorer />
            </Card>
            <Card>
                <HistoricalEvents />
            </Card>
        </div>
    )
}
