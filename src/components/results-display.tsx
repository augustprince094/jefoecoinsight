
"use client"

import type { OptimizationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Leaf, TrendingUp, Car, DollarSign, Sparkles, HelpCircle, PiggyBank, Lightbulb, Bird } from "lucide-react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, LabelList } from "recharts"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProvideAdvisoryOutput } from "@/ai/flows/provide-advisory";
import { regionalBaselineGHG } from "@/lib/additive-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


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

    const economicChartData = [
        { name: "Baseline", cost: baselineCostPerTon ?? 0 },
        { name: inputs.feedAdditive, cost: reformulatedCostPerTon ?? 0 },
    ];
    
    const costs = economicChartData.map(d => d.cost);
    const minCost = Math.min(...costs);
    const yAxisDomainMin = Math.max(0, Math.floor(minCost * 0.95));

    const economicChartConfig = {
        cost: {
            label: "Cost per Ton",
        },
    } satisfies ChartConfig;

    const savingsPerTon = (baselineCostPerTon ?? 0) - (reformulatedCostPerTon ?? 0);
    
    const ghgChartData = [
        { name: "Baseline", ghg: ghgData.baselineGHG ? ghgData.baselineGHG / 1000 : 0 },
        { name: inputs.feedAdditive, ghg: ghgData.ghgWithAdditive ? ghgData.ghgWithAdditive / 1000 : 0 },
    ];
    const ghgChartConfig = {
        ghg: { label: "GHG (tons CO₂e)" }
    } satisfies ChartConfig;
    const ghgValues = ghgChartData.map(d => d.ghg);
    const minGhg = Math.min(...ghgValues);
    const ghgYAxisDomainMin = Math.max(0, Math.floor(minGhg * 0.95));

    const region = inputs.region as keyof typeof regionalBaselineGHG;
    const ghgPerKgLiveWeight = regionalBaselineGHG[region] || regionalBaselineGHG.Canada;
    const equivalentBirds = ghgData.ghgSavings > 0 ? ghgData.ghgSavings / (inputs.broilerLiveWeight * ghgPerKgLiveWeight) : 0;
    const equivalentKm = ghgData.ghgSavings > 0 ? (ghgData.ghgSavings / 1000) * 4100 : 0;

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
             <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Matrix Application Results</h2>
                <p className="text-muted-foreground">
                    Financial and environmental benefits from feed reformulation.
                </p>
            </div>
            
             <Tabs defaultValue="ghg" className="w-full">
                <Card className="bg-white dark:bg-card">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-2">
                             <TabsTrigger value="ghg">
                                <Leaf className="h-4 w-4 mr-2" />
                                GHG Savings
                            </TabsTrigger>
                            <TabsTrigger value="economic">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Economic Performance
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <TabsContent value="ghg">
                       <CardContent className="space-y-6 pt-0">
                             <div className="p-3 rounded-lg border bg-card/50 shadow-sm text-center">
                                <CardDescription className="flex items-center justify-center gap-1.5 text-xs mb-1">
                                    Total GHG Savings
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-80 max-w-sm whitespace-pre-wrap text-xs">
                                                <p className="font-bold mb-2">Calculation Breakdown:</p>
                                                <p>{ghgData.explanation}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </CardDescription>
                                <p className="text-xl font-bold text-accent">
                                    {(ghgData.ghgSavings / 1000).toFixed(2)} tons CO₂e
                                </p>
                            </div>

                            <div className="border-t pt-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-muted-foreground">Total GHG Emissions (tons CO₂e)</p>
                                </div>
                                <ChartContainer config={ghgChartConfig} className="h-[200px] w-full">
                                    <BarChart accessibilityLayer data={ghgChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} />
                                        <YAxis
                                            dataKey="ghg"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => `${value.toFixed(0)} t`}
                                            domain={[ghgYAxisDomainMin, 'auto']}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                            className="text-xs"
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent 
                                                indicator="line"
                                                formatter={(value, name) => `${(value as number).toFixed(2)} tons CO₂e`}
                                            />}
                                        />
                                        <Bar dataKey="ghg" radius={4}>
                                            <LabelList
                                                dataKey="ghg"
                                                position="top"
                                                offset={8}
                                                className="fill-foreground text-xs"
                                                formatter={(value: number) => `${value.toFixed(2)} t`}
                                            />
                                            <Cell fill={baselineColor} />
                                            <Cell fill={additiveColor} />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                            
                            <div className="border-t pt-6">
                                <p className="text-center text-sm text-muted-foreground mb-4">Practical Meaning</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                    <div className="p-4 rounded-lg border bg-card/50 shadow-sm relative overflow-hidden">
                                        <Car className="absolute -left-2 -bottom-2 h-16 w-16 text-muted -z-10 animate-drive-and-wobble" />
                                        <p className="text-sm font-semibold">Equivalent Distance</p>
                                        <p className="text-2xl font-bold text-accent">{equivalentKm.toLocaleString('en-US', { maximumFractionDigits: 0 })} km</p>
                                        <p className="text-xs text-muted-foreground">driven by a passenger car</p>
                                    </div>
                                    <div className="p-4 rounded-lg border bg-card/50 shadow-sm">
                                        <Bird className="h-8 w-8 text-accent mx-auto mb-2 animate-wobble" />
                                        <p className="text-sm font-semibold">Equivalent Production</p>
                                        <p className="text-2xl font-bold text-accent">{equivalentBirds.toLocaleString('en-US', { maximumFractionDigits: 0 })} birds</p>
                                        <p className="text-xs text-muted-foreground">produced with the same emissions</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </TabsContent>
                    <TabsContent value="economic">
                        <CardContent className="space-y-6 pt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border bg-card/50 shadow-sm text-center">
                                    <CardDescription className="flex items-center justify-center gap-1.5 text-xs mb-1">
                                        Total Savings
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-80 max-w-sm whitespace-pre-wrap text-xs">
                                                    <p className="font-bold mb-2">Calculation Breakdown:</p>
                                                    <p>{roiData.explanation}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </CardDescription>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(roiData.feedCostSavings)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg border shadow-sm text-center" style={{ backgroundColor: `${additiveColor}1A`, borderColor: `${additiveColor}33`}}>
                                    <CardDescription className="text-xs mb-1" style={{color: additiveColor}}>ROI</CardDescription>
                                    <p className="text-xl font-bold" style={{color: additiveColor}}>
                                        {roiData.roi.toFixed(1)} : 1
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-muted-foreground">Feed Cost per Ton</p>
                                    <p className="text-lg font-bold" style={{color: additiveColor}}>
                                        Saving of {formatCurrency(savingsPerTon)} per ton
                                    </p>
                                </div>
                                <ChartContainer config={economicChartConfig} className="h-[200px] w-full">
                                    <BarChart accessibilityLayer data={economicChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} />
                                        <YAxis
                                            dataKey="cost"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => formatCurrency(value as number, { notation: 'compact' })}
                                            domain={[yAxisDomainMin, 'auto']}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                            className="text-xs"
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent 
                                                indicator="line"
                                                formatter={(value) => formatCurrency(value as number, {minimumFractionDigits: 2})}
                                            />}
                                        />
                                        <Bar dataKey="cost" radius={4}>
                                            <LabelList
                                                dataKey="cost"
                                                position="top"
                                                offset={8}
                                                className="fill-foreground text-xs"
                                                formatter={(value: number) => formatCurrency(value, {minimumFractionDigits: 2})}
                                            />
                                            <Cell fill={baselineColor} />
                                            <Cell fill={additiveColor} />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </TabsContent>
                </Card>
            </Tabs>

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
    
    const economicChartData = [
        { name: "Baseline", cost: roiData.feedCostPerLiveWeightBefore * inputs.broilerLiveWeight },
        { name: inputs.feedAdditive, cost: roiData.feedCostPerLiveWeightAfter * inputs.broilerLiveWeight },
    ];
    
    const costs = economicChartData.map(d => d.cost);
    const minCost = Math.min(...costs);
    const yAxisDomainMin = Math.max(0, Math.floor(minCost * 0.95 * 100) / 100);

    const economicChartConfig = {
        cost: {
            label: "Cost",
        },
    } satisfies ChartConfig;

    const ghgChartData = [
        { name: "Baseline", ghg: ghgData.baselineGHG ? ghgData.baselineGHG / 1000 : 0 },
        { name: inputs.feedAdditive, ghg: ghgData.ghgWithAdditive ? ghgData.ghgWithAdditive / 1000 : 0 },
    ];

    const ghgChartConfig = {
        ghg: { label: "GHG (tons CO₂e)" }
    } satisfies ChartConfig;
    
    const ghgValues = ghgChartData.map(d => d.ghg);
    const minGhg = Math.min(...ghgValues);
    const ghgYAxisDomainMin = Math.max(0, Math.floor(minGhg * 0.95));

    const region = inputs.region as keyof typeof regionalBaselineGHG;
    const ghgPerKgLiveWeight = regionalBaselineGHG[region] || regionalBaselineGHG.Canada;
    const equivalentBirds = ghgData.ghgSavings > 0 ? ghgData.ghgSavings / (inputs.broilerLiveWeight * ghgPerKgLiveWeight) : 0;
    const equivalentKm = ghgData.ghgSavings > 0 ? (ghgData.ghgSavings / 1000) * 4100 : 0;


    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">On-Top Application Results</h2>
                <p className="text-muted-foreground">
                    Financial and environmental benefits from performance improvements.
                </p>
            </div>

            <Tabs defaultValue="ghg" className="w-full">
                <Card className="bg-white dark:bg-card">
                    <CardHeader>
                         <TabsList className="grid w-full grid-cols-2">
                             <TabsTrigger value="ghg">
                                <Leaf className="h-4 w-4 mr-2" />
                                GHG Savings
                            </TabsTrigger>
                            <TabsTrigger value="economic">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Economic Performance
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <TabsContent value="ghg">
                       <CardContent className="space-y-6 pt-0">
                            <div className="p-3 rounded-lg border bg-card/50 shadow-sm text-center">
                                <CardDescription className="flex items-center justify-center gap-1.5 text-xs mb-1">
                                    Total GHG Savings
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-80 max-w-sm whitespace-pre-wrap text-xs">
                                                <p className="font-bold mb-2">Calculation Breakdown:</p>
                                                <p>{ghgData.explanation}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </CardDescription>
                                <p className="text-xl font-bold text-accent">
                                    {(ghgData.ghgSavings / 1000).toFixed(2)} tons CO₂e
                                </p>
                            </div>
                             <div className="border-t pt-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-muted-foreground">Total GHG Emissions (tons CO₂e)</p>
                                </div>
                                <ChartContainer config={ghgChartConfig} className="h-[200px] w-full">
                                    <BarChart accessibilityLayer data={ghgChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} />
                                        <YAxis
                                            dataKey="ghg"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => `${value.toFixed(0)} t`}
                                            domain={[ghgYAxisDomainMin, 'auto']}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                            className="text-xs"
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent 
                                                indicator="line"
                                                formatter={(value, name) => `${(value as number).toFixed(2)} tons CO₂e`}
                                            />}
                                        />
                                        <Bar dataKey="ghg" radius={4}>
                                            <LabelList
                                                dataKey="ghg"
                                                position="top"
                                                offset={8}
                                                className="fill-foreground text-xs"
                                                formatter={(value: number) => `${value.toFixed(2)} t`}
                                            />
                                            <Cell fill={baselineColor} />
                                            <Cell fill={additiveColor} />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>

                            <div className="border-t pt-6">
                                <p className="text-center text-sm text-muted-foreground mb-4">Practical Meaning</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                    <div className="p-4 rounded-lg border bg-card/50 shadow-sm relative overflow-hidden">
                                        <Car className="absolute -left-2 -bottom-2 h-16 w-16 text-muted -z-10 animate-drive-and-wobble" />
                                        <p className="text-sm font-semibold">Equivalent Distance</p>
                                        <p className="text-2xl font-bold text-accent">{equivalentKm.toLocaleString('en-US', { maximumFractionDigits: 0 })} km</p>
                                        <p className="text-xs text-muted-foreground">driven by a passenger car</p>
                                    </div>
                                    <div className="p-4 rounded-lg border bg-card/50 shadow-sm">
                                        <Bird className="h-8 w-8 text-accent mx-auto mb-2 animate-wobble" />
                                        <p className="text-sm font-semibold">Equivalent Production</p>
                                        <p className="text-2xl font-bold text-accent">{equivalentBirds.toLocaleString('en-US', { maximumFractionDigits: 0 })} birds</p>
                                        <p className="text-xs text-muted-foreground">produced with the same emissions</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </TabsContent>
                     <TabsContent value="economic">
                        <CardContent className="space-y-6 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="p-3 rounded-lg border bg-card/50 shadow-sm">
                                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
                                        <DollarSign className="h-4 w-4" /> Cost Reduction
                                    </p>
                                    <p className="text-2xl font-bold">{feedCostReduction.toFixed(1)}%</p>
                                </div>
                                <div className="p-3 rounded-lg border bg-card/50 shadow-sm">
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
                                 <div className="p-3 rounded-lg border shadow-sm" style={{ backgroundColor: `${additiveColor}1A`, borderColor: `${additiveColor}33`}}>
                                    <p className="text-sm flex items-center justify-center gap-1.5 mb-1" style={{color: additiveColor}}>
                                      <TrendingUp className="h-4 w-4" /> ROI
                                    </p>
                                    <p className="text-2xl font-bold" style={{ color: additiveColor }}>{roiData.roi.toFixed(1)} : 1</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-6">
                                <div className="text-center mb-4">
                                     <p className="text-sm text-muted-foreground">Feed Cost per Bird</p>
                                    <p className="text-lg font-bold" style={{color: additiveColor}}>
                                        Reduction of {formatCurrency(roiData.feedCostPerLiveWeightBefore * inputs.broilerLiveWeight - roiData.feedCostPerLiveWeightAfter * inputs.broilerLiveWeight)} per bird
                                    </p>
                                </div>
                                <ChartContainer config={economicChartConfig} className="h-[150px] w-full">
                                    <BarChart accessibilityLayer data={economicChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
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
                                                formatter={(value) => formatCurrency(value as number, {minimumFractionDigits: 3})}
                                            />}
                                        />
                                        <Bar dataKey="cost" radius={4}>
                                           <LabelList
                                                dataKey="cost"
                                                position="top"
                                                offset={8}
                                                className="fill-foreground text-xs"
                                                formatter={(value: number) => formatCurrency(value, {minimumFractionDigits: 2})}
                                            />
                                           <Cell fill={baselineColor} />
                                           <Cell fill={additiveColor} />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </TabsContent>
                </Card>
            </Tabs>
            
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

    

    

    