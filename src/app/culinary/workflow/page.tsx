'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Workflow } from "lucide-react";

export default function CulinaryWorkflowPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Card className="max-w-md">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                      <Workflow className="h-10 w-10 text-muted-foreground"/>
                    </div>
                    <CardTitle className="mt-4">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        Tools for kitchen workflow and team communication are being developed. This will help streamline kitchen operations and collaboration.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
