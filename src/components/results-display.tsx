
"use client"

import type { OptimizationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Leaf, TrendingUp, Car, DollarSign, Sparkles, HelpCircle, PiggyBank, Lightbulb, ChevronsRight } from "lucide-react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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

const additiveColorMap: { [key: string]: string } = {
    "Jefo Pro Solution": "#FCB839", // golden yellow
    "Jefo P(OA+EO)": "#C00000",   // dark red
    "Jefo Xylanase": "#EB5C41",    // orange-red (Belfeed)
};
const baselineColor = "#AEAEAE"; // neutral gray
const defaultAdditiveColor = "hsl(var(--primary))";

const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        ...options
    }).format(value);
}

const AdvisoryCard = ({ advisoryData, additiveColor }: { advisoryData: ProvideAdvisoryOutput | undefined, additiveColor: string }) => {
  if (!advisoryData?.summary && !advisoryData?.keyBenefit) return null;

  return (
    <Card style={{ backgroundColor: `${additiveColor}0D`, borderColor: `${additiveColor}33` }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: additiveColor }}>
          <Sparkles className="h-6 w-6" />
          Smart Advisory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {advisoryData.summary && (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {advisoryData.summary}
            </p>
        )}
        {advisoryData.keyBenefit && (
            <div className="border-t pt-4" style={{ borderColor: `${additiveColor}33` }}>
                <h4 className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: additiveColor }}>
                    <Lightbulb className="h-5 w-5" />
                    Key Benefit
                </h4>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {advisoryData.keyBenefit}
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

function MatrixDashboard({ results }: { results: OptimizationResult }) {
    const { roiData, ghgData, advisoryData, inputs } = results;
    const additiveColor = additiveColorMap[inputs.feedAdditive as keyof typeof additiveColorMap] || defaultAdditiveColor;
    
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
    const equivalentKm = (ghgData.ghgSavings * 4.1).toFixed(0);

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <Card className="bg-white dark:bg-card">
                <CardHeader>
                    <CardTitle>Matrix Application Results</CardTitle>
                    <CardDescription>
                        Summary of financial and environmental benefits from feed reformulation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={["economic", "ghg"]} className="w-full">
                        <AccordionItem value="economic">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                    </div>
                                    Economic Performance
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <Card className="p-4 flex flex-col items-center justify-center text-center bg-card/50">
                                        <CardDescription className="flex items-center justify-center gap-1.5">
                                            Total Feed Cost Savings
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="w-80 max-w-sm whitespace-pre-wrap text-xs">
                                                        <p className="font-bold mb-2">Calculation Breakdown:</p>
                                                        <p>{roiData.explanation}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </CardDescription>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(roiData.feedCostSavings)}
                                        </p>
                                    </Card>
                                    <Card className="p-4 flex flex-col items-center justify-center text-center" style={{ backgroundColor: `${additiveColor}1A`, borderColor: `${additiveColor}33`}}>
                                       <CardDescription style={{color: additiveColor}}>Return on Investment</CardDescription>
                                        <p className="text-2xl font-bold" style={{color: additiveColor}}>
                                            {roiData.roi.toFixed(1)} : 1
                                        </p>
                                    </Card>
                                </div>

                                <div className="border-t pt-6">
                                     <div className="text-center mb-4">
                                        <p className="text-sm text-muted-foreground">Feed Cost per Ton</p>
                                        <p className="text-xl font-bold" style={{color: additiveColor}}>
                                           Saving of {formatCurrency(savingsPerTon)} per ton of feed
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
                                               <Cell fill={baselineColor} />
                                               <Cell fill={additiveColor} />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="ghg">
                             <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-md">
                                        <Leaf className="h-5 w-5 text-accent" />
                                    </div>
                                    GHG Savings
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 text-center">
                                <p className="text-3xl font-bold text-accent">
                                    {(ghgData.ghgSavings / 1000).toFixed(2)}
                                    <span className="text-lg font-normal ml-2">tons CO₂e</span>
                                </p>
                                <p className="text-muted-foreground mb-4 flex items-center justify-center gap-1.5">
                                  Total greenhouse gas savings
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
                                </p>
                                
                                <div className="relative h-20 w-full mb-4 mt-8">
                                    <div className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 border-t-2 border-dashed border-muted-foreground/30" />
                                    <Car className="h-20 w-20 text-accent absolute bottom-0 animate-drive-and-wobble" style={{ animationDelay: '-3s, 0s' }}/>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This is equivalent to driving <span className="font-bold text-accent">{equivalentKm} km</span> in a standard gasoline car.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
            <AdvisoryCard advisoryData={advisoryData} additiveColor={additiveColor}/>
        </div>
    );
}


function OnTopDashboard({ results }: { results: OptimizationResult }) {
    const { roiData, ghgData, advisoryData, inputs } = results;
    const additiveColor = additiveColorMap[inputs.feedAdditive as keyof typeof additiveColorMap] || defaultAdditiveColor;

    const feedCostReduction = roiData.feedCostPerLiveWeightBefore > 0
        ? ((roiData.feedCostPerLiveWeightBefore - roiData.feedCostPerLiveWeightAfter) / roiData.feedCostPerLiveWeightBefore) * 100
        : 0;
    
    const chartData = [
        { name: "Baseline", cost: roiData.feedCostPerLiveWeightBefore * inputs.broilerLiveWeight },
        { name: "With Additive", cost: roiData.feedCostPerLiveWeightAfter * inputs.broilerLiveWeight },
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
            {/* Panel 1: Feed Cost Comparison */}
            <Card className="bg-white dark:bg-card">
                <CardHeader>
                    <CardTitle className="text-lg">Feed Cost per Live Weight</CardTitle>
                    <CardDescription>A comparison of the feed cost per live weight bird, before and after using the additive.</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                     <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
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
                               <Cell fill={baselineColor} />
                               <Cell fill={additiveColor} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Panel 2: Economic Performance Summary */}
            <Card className="bg-white dark:bg-card">
                <CardHeader>
                    <CardTitle className="text-lg">Economic Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg border bg-card shadow-sm">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
                                <TrendingUp className="h-4 w-4" /> ROI
                            </p>
                            <p className="text-2xl font-bold" style={{ color: additiveColor }}>{roiData.roi.toFixed(1)} : 1</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card shadow-sm">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
                                <DollarSign className="h-4 w-4" /> Cost Reduction
                            </p>
                            <p className="text-2xl font-bold">{feedCostReduction.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card shadow-sm">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
                                <PiggyBank className="h-4 w-4" /> Total Savings
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="w-80 max-w-sm whitespace-pre-wrap text-xs">
                                            <p className="font-bold mb-2">Calculation Breakdown:</p>
                                            <p>{roiData.explanation}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </p>
                            <p className="text-2xl font-bold">{formatCurrency(roiData.feedCostSavings)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Panel 3: Environmental Impact */}
            <Card className="bg-white dark:bg-card">
                <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-accent" />
                        Environmental Impact
                    </CardTitle>
                    <CardDescription>
                        Your estimated GHG savings and its real-world equivalent.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-accent">
                        {(ghgData.ghgSavings / 1000).toFixed(2)}
                        <span className="text-lg font-normal ml-2">tons CO₂e</span>
                    </p>
                    <p className="text-muted-foreground mb-4">Total greenhouse gas savings.</p>
                    
                    <div className="relative h-20 w-full mb-4 mt-8">
                        <div className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 border-t-2 border-dashed border-muted-foreground/30" />
                        <Car className="h-20 w-20 text-accent absolute bottom-0 animate-drive-and-wobble" style={{ animationDelay: '-3s, 0s' }}/>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This is equivalent to driving <span className="font-bold text-accent">{equivalentKm} km</span> in a standard gasoline car.
                    </p>
                </CardContent>
            </Card>
            
            <AdvisoryCard advisoryData={advisoryData} additiveColor={additiveColor} />
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
        );
    }

    if (results.inputs.applicationType === 'Matrix') {
        return <MatrixDashboard results={results} />;
    }
    
    return <OnTopDashboard results={results} />;
}
