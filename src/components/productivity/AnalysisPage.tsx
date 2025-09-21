
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwotAnalysis } from "./SwotAnalysis";
import { TowsMatrix } from "./TowsMatrix";
import { SoarAnalysis } from "./SoarAnalysis";
import { ScoreAnalysis } from "./ScoreAnalysis";

export function AnalysisPage() {

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs defaultValue="swot" className="w-full flex-1 flex flex-col">
                <div className="text-center mb-6">
                    <TabsList>
                        <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
                        <TabsTrigger value="tows">TOWS Matrix</TabsTrigger>
                        <TabsTrigger value="soar">SOAR Analysis</TabsTrigger>
                        <TabsTrigger value="score">SCORE Analysis</TabsTrigger>
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
                 <TabsContent value="score" className="flex-1">
                    <ScoreAnalysis />
                </TabsContent>
            </Tabs>
        </div>
    )
}
