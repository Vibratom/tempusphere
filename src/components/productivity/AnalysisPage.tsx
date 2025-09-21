
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwotAnalysis } from "./SwotAnalysis";
import { TowsMatrix } from "./TowsMatrix";

export function AnalysisPage() {

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs defaultValue="swot" className="w-full flex-1 flex flex-col">
                <div className="text-center mb-6">
                    <TabsList>
                        <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
                        <TabsTrigger value="tows">TOWS Matrix</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="swot" className="flex-1">
                    <SwotAnalysis />
                </TabsContent>
                <TabsContent value="tows" className="flex-1">
                    <TowsMatrix />
                </TabsContent>
            </Tabs>
        </div>
    )
}
