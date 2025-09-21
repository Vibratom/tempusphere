'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function CulinaryCalculatorsPage() {
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
                        A suite of specialized culinary calculators is being developed to help with tasks like recipe scaling, ingredient substitutions, and more.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
