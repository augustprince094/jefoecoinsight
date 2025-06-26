"use client"

import type { OptimizationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, Leaf, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "./ui/button";
import { exportResultsToCsv } from "@/lib/utils";
import Image from "next/image";

interface ResultsDisplayProps {
    results: OptimizationResult | null;
    isLoading: boolean;
    error: string | null;
}

export function ResultsDisplay({ results, isLoading, error }: ResultsDisplayProps) {

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        );
    }
    
    if (!results) {
        return (
             <Card className="flex flex-col items-center justify-center text-center p-8 h-full">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full">
                      <Image src="https://placehold.co/80x80.png" alt="Cow illustration" width={80} height={80} className="rounded-full" data-ai-hint="cow illustration" />
                  </div>
                    <CardTitle className="mt-4">Ready to Optimize?</CardTitle>
                    <CardDescription>
                        Fill out the form to calculate the ROI and GHG savings for your livestock operation. Your results will appear here.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const { roiData, ghgData, inputs } = results;

    const roiChartData = [
        { name: "ROI", value: roiData.roi * 100, fill: "hsl(var(--primary))" }
    ];

    const ghgChartData = [
        { name: "GHG Savings", value: ghgData.ghgSavings, fill: "hsl(var(--accent))" }
    ];
    
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-6 w-6 text-primary" />
                                Return on Investment (ROI)
                            </CardTitle>
                             <CardDescription>Financial performance of the feed additive.</CardDescription>
                        </div>
                        <div className="text-3xl font-bold text-primary">
                            {(roiData.roi * 100).toFixed(2)}%
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="h-40">
                       <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roiChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    content={<ChartTooltipContent
                                        formatter={(value) => `${(value as number).toFixed(2)}%`}
                                    />}
                                />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 p-4 bg-muted/50 rounded-lg">{roiData.explanation}</p>
                </CardContent>
                 <CardFooter>
                    <Button onClick={() => exportResultsToCsv(results)} className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Export All Results (CSV)
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                     <div className="flex items-start justify-between">
                        <div>
                             <CardTitle className="flex items-center gap-2">
                                <Leaf className="h-6 w-6 text-accent" />
                                GHG Savings
                            </CardTitle>
                            <CardDescription>Estimated environmental impact reduction.</CardDescription>
                        </div>
                        <div className="text-3xl font-bold text-accent">
                            {ghgData.ghgSavings.toFixed(2)}
                            <span className="text-base font-normal text-muted-foreground ml-1">kg CO₂e</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">{ghgData.explanation}</p>
                </CardContent>
            </Card>
        </div>
    );
}
