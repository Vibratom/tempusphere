'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function YieldPercentagePage() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Card className="max-w-md">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                      <Calculator className="h-10 w-10 text-muted-foreground"/>
                    </div>
                    <CardTitle className="mt-4">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                       The Yield Percentage Converter is being developed. It will help you scale recipes up or down by calculating new ingredient quantities based on your desired yield.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
