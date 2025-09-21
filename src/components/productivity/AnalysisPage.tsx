
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwotAnalysis } from "./SwotAnalysis";
import { TowsMatrix } from "./TowsMatrix";
import { SoarAnalysis } from "./SoarAnalysis";

export function AnalysisPage() {

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs defaultValue="swot" className="w-full flex-1 flex flex-col">
                <div className="text-center mb-6">
                    <TabsList>
                        <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
                        <TabsTrigger value="tows">TOWS Matrix</TabsTrigger>
                        <TabsTrigger value="soar">SOAR Analysis</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="swot" className="flex-1">
                    <SwotAnalysis />
                </TabsContent>
                <TabsContent value="tows" className="flex-1">
                    <TowsMatrix />
                </TabsContent>
                <TabsContent value="soar" className="flex-1">
                    <SoarAnalysis />
                </TabsContent>
            </Tabs>
        </div>
    )
}
