"use client"

import type { OptimizationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Leaf, TrendingUp, Car, DollarSign, Sparkles, HelpCircle, Zap } from "lucide-react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProvideAdvisoryOutput } from "@/ai/flows/provide-advisory";

const AdvisoryCard = ({ advisoryData }: { advisoryData: ProvideAdvisoryOutput | undefined }) => {
  if (!advisoryData?.advisoryText) return null;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="h-6 w-6" />
          Smart Advisory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {advisoryData.advisoryText}
        </div>
      </CardContent>
    </Card>
  );
};

function MatrixDashboard({ results }: { results: OptimizationResult }) {
    const { roiData, ghgData, advisoryData } = results;

    const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            ...options
        }).format(value);
    }
    
    const { baselineCostPerTon, reformulatedCostPerTon } = roiData;

    const chartData = [
        { name: "Baseline", cost: baselineCostPerTon ?? 0 },
        { name: "With Additive", cost: reformulatedCostPerTon ?? 0 },
    ];
    
    const costs = chartData.map(d => d.cost);
    const minCost = Math.min(...costs);
    const yAxisDomainMin = Math.max(0, Math.floor(minCost * 0.95));

    const chartConfig = {
        cost: {
            label: "Cost per Ton",
        },
    } satisfies ChartConfig;

    const savingsPerTon = (baselineCostPerTon ?? 0) - (reformulatedCostPerTon ?? 0);

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <Card>
                <CardHeader>
                    <CardTitle>Matrix Application Results</CardTitle>
                    <CardDescription>
                        Summary of financial and environmental benefits from feed reformulation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 flex flex-col items-center justify-center text-center">
                             <CardDescription>Total Feed Cost Savings</CardDescription>
                             <p className="text-2xl font-bold">
                                {formatCurrency(roiData.feedCostSavings)}
                            </p>
                        </Card>
                        <Card className="p-4 flex flex-col items-center justify-center text-center bg-primary/10 border-primary/20">
                           <CardDescription className="text-primary">Return on Investment</CardDescription>
                            <p className="text-2xl font-bold text-primary">
                                {roiData.roi.toFixed(1)} : 1
                            </p>
                        </Card>
                        <Card className="p-4 flex flex-col items-center justify-center text-center">
                            <CardDescription className="flex items-center justify-center gap-1.5">
                                Total GHG Savings
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="w-64 whitespace-pre-wrap">
                                            <p>{ghgData.explanation}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </CardDescription>
                             <p className="text-2xl font-bold text-accent">
                                {(ghgData.ghgSavings / 1000).toFixed(2)}
                                <span className="text-base font-normal text-muted-foreground ml-1">tons CO₂e</span>
                            </p>
                        </Card>
                    </div>

                    <div className="border-t pt-6">
                        <div className="text-center mb-4">
                            <p className="text-sm text-muted-foreground">Feed Cost per Ton</p>
                            <p className="text-xl font-bold text-primary">
                               Saving of {formatCurrency(savingsPerTon)} per ton
                            </p>
                        </div>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <YAxis
                                    dataKey="cost"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `$${value.toFixed(0)}`}
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
                                    content={<ChartTooltipContent 
                                        indicator="line"
                                        formatter={(value, name) => (
                                            <div className="flex w-full justify-between items-center gap-4">
                                                <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                                                <span className="font-bold">{formatCurrency(value as number, {minimumFractionDigits: 2})}</span>
                                            </div>
                                        )}
                                    />}
                                />
                                <Bar dataKey="cost" radius={4}>
                                   <Cell fill="hsl(var(--secondary))" />
                                   <Cell fill="hsl(var(--primary))" />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
            <AdvisoryCard advisoryData={advisoryData} />
        </div>
    );
}


function OnTopDashboard({ results }: { results: OptimizationResult }) {
    const { roiData, ghgData, advisoryData, inputs } = results;

    const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            ...options
        }).format(value);
    }

    const feedCostReduction = roiData.feedCostPerLiveWeightBefore > 0
        ? ((roiData.feedCostPerLiveWeightBefore - roiData.feedCostPerLiveWeightAfter) / roiData.feedCostPerLiveWeightBefore) * 100
        : 0;
    
    const chartData = [
        { name: "Baseline", cost: roiData.feedCostPerLiveWeightBefore },
        { name: "With Additive", cost: roiData.feedCostPerLiveWeightAfter },
    ];
    
    const costs = chartData.map(d => d.cost);
    const minCost = Math.min(...costs);
    const yAxisDomainMin = Math.max(0, Math.floor(minCost * 0.95 * 100) / 100);

    const chartConfig = {
        cost: {
            label: "Cost",
        },
    } satisfies ChartConfig;

    const equivalentKm = (ghgData.ghgSavings * 4.1).toFixed(0);

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Return on Investment</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-2xl font-bold text-primary">{roiData.roi.toFixed(1)} : 1</div>
                        <p className="text-xs text-muted-foreground">Ratio</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Feed Cost Reduction</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-2xl font-bold">{feedCostReduction.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Per surviving bird</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Improved FCR</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-2xl font-bold">
                           {inputs.feedConversionRatioAfter.toFixed(3)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {inputs.baselineFCR.toFixed(3)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-accent">GHG Savings</CardTitle>
                        <Leaf className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-2xl font-bold text-accent">
                            {(ghgData.ghgSavings / 1000).toFixed(2)}
                            <span className="text-base font-normal ml-1">tons</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            CO₂ equivalent
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-64 whitespace-pre-wrap">
                                        <p>{ghgData.explanation}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Feed Cost Analysis</CardTitle>
                    <CardDescription>Comparison of feed cost per surviving bird.</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
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
                                content={<ChartTooltipContent 
                                    indicator="line"
                                    formatter={(value, name) => (
                                        <div className="flex w-full justify-between items-center gap-4">
                                            <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                                            <span className="font-bold">{formatCurrency(value as number, {minimumFractionDigits: 3})}</span>
                                        </div>
                                    )}
                                />}
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
                    <CardTitle className="text-lg">Environmental Impact</CardTitle>
                    <CardDescription>Equivalent GHG savings visualized.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 text-center">
                    <div className="relative h-10 w-full mb-4">
                        <div className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 border-t-2 border-dashed border-muted-foreground/30" />
                        <Car className="h-8 w-8 text-accent absolute bottom-0 animate-drive-and-wobble" style={{ animationDelay: '-3s, 0s' }}/>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This is equivalent to driving <span className="font-bold text-accent">{equivalentKm} km</span> in a standard gasoline car.
                    </p>
                </CardContent>
            </Card>
            <AdvisoryCard advisoryData={advisoryData} />
        </div>
    );
}


export function ResultsDisplay({ results, isLoading, error }: { results: OptimizationResult | null; isLoading: boolean; error: string | null; }) {

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

    if (results.inputs.applicationType === 'Matrix') {
        return <MatrixDashboard results={results} />;
    }
    
    return <OnTopDashboard results={results} />;
}
