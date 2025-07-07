
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FormValues } from "@/lib/types";
import { formSchema, feedAdditiveTypes, regions } from "@/lib/types";
import { getOptimizationResults } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HelpCircle } from "lucide-react";
import React, { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OptimizerFormProps {
  setResults: (results: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isCalculating: boolean;
}

export function OptimizerForm({ setResults, setIsLoading, setError, isCalculating }: OptimizerFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "Canada",
      numberOfBirds: 50000,
      broilerLiveWeight: 2.5,
      baselineMortalityRate: 4.5,
      baselineFCR: 1.75,
      feedCost: 0.80,
      feedAdditive: "Jefo Pro Solution",
      applicationType: "Matrix",
      inclusionRate: 125,
      additiveCost: 12.50,
      feedConversionRatioAfter: 0,
      mortalityRateAfter: 0,
    },
  });
  const { toast } = useToast();
  const { watch, setValue } = form;

  const feedAdditiveValue = watch("feedAdditive");
  const baselineFCRValue = watch("baselineFCR");
  const baselineMortalityRateValue = watch("baselineMortalityRate");
  const showApplicationType =
    feedAdditiveValue === "Jefo Pro Solution" ||
    feedAdditiveValue === "Jefo Xylanase";

  useEffect(() => {
    // Set default inclusion rate based on additive
    if (feedAdditiveValue) {
      let newInclusionRate = 0;
      switch (feedAdditiveValue) {
        case "Jefo Pro Solution": newInclusionRate = 125; break;
        case "Jefo Xylanase": newInclusionRate = 100; break;
        case "Jefo P(OA+EO)": newInclusionRate = 200; break;
      }
      if (newInclusionRate > 0) {
        setValue("inclusionRate", newInclusionRate, { shouldValidate: true });
      }
    }

    // FCR Calculation
    if (feedAdditiveValue && baselineFCRValue > 0) {
      let fcrReduction = 0;
      switch (feedAdditiveValue) {
        case "Jefo Pro Solution": fcrReduction = 0.04; break;
        case "Jefo P(OA+EO)": fcrReduction = 0.05; break;
        case "Jefo Xylanase": fcrReduction = 0.06; break;
      }
      const newFCR = baselineFCRValue - fcrReduction;
      setValue("feedConversionRatioAfter", parseFloat(newFCR.toFixed(3)), { shouldValidate: true });
    }

    // Mortality Rate Calculation
    if (feedAdditiveValue && baselineMortalityRateValue > 0) {
      let mortalityReduction = 0;
      switch (feedAdditiveValue) {
        case "Jefo Pro Solution": mortalityReduction = 1.2; break;
        case "Jefo P(OA+EO)": mortalityReduction = 1.6; break;
        case "Jefo Xylanase": mortalityReduction = 1.4; break;
      }
      const newMortalityRate = baselineMortalityRateValue - mortalityReduction;
      setValue("mortalityRateAfter", Math.max(0, parseFloat(newMortalityRate.toFixed(2))), { shouldValidate: true });
    }

  }, [feedAdditiveValue, baselineFCRValue, baselineMortalityRateValue, setValue]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const result = await getOptimizationResults(data);
      if (result.error) {
        throw new Error(result.error);
      }
      setResults(result.data);
    } catch (e: any) {
      setError(e.message);
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Production Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region of Interest</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfBirds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birds per cycle</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="broilerLiveWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="baselineMortalityRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Baseline Mortality Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baselineFCR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    Baseline FCR
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Feed Conversion Ratio (before additive).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="feedCost"
              render={({ field }) => (
                <FormItem>
                   <FormLabel className="flex items-center gap-1.5">
                    Feed cost ($/ kg live weight)
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The cost of feed to produce 1kg of live weight.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Feed Additive & Costs</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="feedAdditive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feed Additive Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an additive..." />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {feedAdditiveTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showApplicationType && (
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="applicationType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Application Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Matrix" id="matrix" />
                            </FormControl>
                            <FormLabel htmlFor="matrix" className="font-normal cursor-pointer">
                              Matrix
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="On-top" id="on-top" />
                            </FormControl>
                            <FormLabel htmlFor="on-top" className="font-normal cursor-pointer">
                              On-top
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="inclusionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inclusion Rate (g/ton)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additiveCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additive Cost ($/kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={isCalculating}>
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            "Calculate ROI & GHG Savings"
          )}
        </Button>
      </form>
    </Form>
  );
}
