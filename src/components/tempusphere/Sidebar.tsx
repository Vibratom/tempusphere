
'use client';
import { useState } from "react";
import { TabbedPanels, TABS } from "./TabbedPanels";

export function Sidebar({ header }: { header: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    return (
        <div className="w-full max-w-sm border-r flex flex-col">
            {header}
            <div className="p-4">
                <TabbedPanels activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
    )
}
