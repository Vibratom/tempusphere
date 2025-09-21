'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { KanbanSquare } from "lucide-react";

export default function KdsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Card className="max-w-md">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                        <KanbanSquare className="h-10 w-10 text-muted-foreground"/>
                    </div>
                    <CardTitle className="mt-4">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        This tool is currently under development. Please check back later!
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
