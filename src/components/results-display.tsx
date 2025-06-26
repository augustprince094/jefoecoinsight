"use client"

import type { OptimizationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Leaf, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
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

    const { roiData, ghgData } = results;

    const feedCostChartData = [
        { name: "Baseline", cost: roiData.feedCostPerLiveWeightBefore },
        { name: "With Additive", cost: roiData.feedCostPerLiveWeightAfter }
    ];

    const feedCostChartConfig = {
      cost: {
        label: "$ / kg Live Weight",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig;
    
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
                        <div className="text-3xl font-bold text-primary text-right">
                           {roiData.roi.toFixed(1)} : 1
                           <p className="text-sm font-normal text-muted-foreground">Ratio</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <h4 className="text-sm font-semibold mb-2">Feed Cost per kg Live Weight Comparison</h4>
                     <div className="h-48">
                       <ChartContainer config={feedCostChartConfig}>
                            <BarChart data={feedCostChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis
                                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent
                                        formatter={(value) => `$${(value as number).toFixed(3)}`}
                                    />}
                                />
                                <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
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
            </Card>
        </div>
    );
}
