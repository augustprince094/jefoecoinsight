"use client"

import type { OptimizationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Leaf, TrendingUp, Car } from "lucide-react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

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
    
    const chartData = [
        { name: "Baseline", cost: roiData.feedCostPerLiveWeightBefore },
        { name: "With Additive", cost: roiData.feedCostPerLiveWeightAfter },
    ];
    
    // Calculate a dynamic Y-axis domain to make the difference more observable
    const costs = chartData.map(d => d.cost);
    const minCost = Math.min(...costs);
    const yAxisDomainMin = Math.max(0, Math.floor(minCost * 0.95 * 100) / 100);

    const chartConfig = {
        cost: {
            label: "Feed Cost ($/kg)",
        },
        baseline: {
            label: "Baseline",
            color: "hsl(var(--secondary))",
        },
        additive: {
            label: "With Additive",
            color: "hsl(var(--primary))",
        }
    } satisfies ChartConfig;

    const equivalentKm = (ghgData.ghgSavings / 180).toFixed(0);

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
                <CardContent className="border-t pt-4">
                     <p className="text-sm font-medium text-center text-muted-foreground mb-2">Feed Cost per kg Live Weight</p>
                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <YAxis
                                dataKey="cost"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `$${value.toFixed(2)}`}
                                domain={[yAxisDomainMin, 'auto']}
                            />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Bar dataKey="cost" radius={4}>
                               <Cell fill="hsl(var(--secondary))" />
                               <Cell fill="hsl(var(--primary))" />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
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
                <CardContent className="border-t pt-4 text-center">
                    <div className="relative overflow-hidden h-10 w-full mb-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-muted-foreground/30">
                            <div className="absolute left-0 top-0 w-full h-full border-t-2 border-dashed border-muted-foreground/50"></div>
                        </div>
                        <Car className="h-8 w-8 text-accent absolute top-0 animate-drive"/>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This is equivalent to driving <span className="font-bold text-accent">{equivalentKm} km</span> using a gasoline powered car.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
