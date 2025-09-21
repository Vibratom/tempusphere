
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwotAnalysis } from "./SwotAnalysis";
import { TowsMatrix } from "./TowsMatrix";
import { SoarAnalysis } from "./SoarAnalysis";
import { ScoreAnalysis } from "./ScoreAnalysis";
import { NoiseAnalysis } from "./NoiseAnalysis";
import { PestleAnalysis } from "./PestleAnalysis";
import { PortersFiveForces } from "./PortersFiveForces";

export function AnalysisPage() {

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs defaultValue="swot" className="w-full flex-1 flex flex-col">
                <div className="text-center mb-6">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 h-auto">
                        <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
                        <TabsTrigger value="tows">TOWS Matrix</TabsTrigger>
                        <TabsTrigger value="soar">SOAR Analysis</TabsTrigger>
                        <TabsTrigger value="score">SCORE Analysis</TabsTrigger>
                        <TabsTrigger value="noise">NOISE Analysis</TabsTrigger>
                        <TabsTrigger value="pestle">PESTLE Analysis</TabsTrigger>
                        <TabsTrigger value="porters">Porter's 5 Forces</TabsTrigger>
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
                 <TabsContent value="noise" className="flex-1">
                    <NoiseAnalysis />
                </TabsContent>
                 <TabsContent value="pestle" className="flex-1">
                    <PestleAnalysis />
                </TabsContent>
                <TabsContent value="porters" className="flex-1">
                    <PortersFiveForces />
                </TabsContent>
            </Tabs>
        </div>
    )
}
