
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FormValues } from "@/lib/types";
import { formSchema, feedAdditiveTypes } from "@/lib/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";

interface OptimizerFormProps {
  setResults: (results: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isCalculating: boolean;
}

export function OptimizerForm({ setResults, setIsLoading, setError, isCalculating }: OptimizerFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  const { toast } = useToast();
  const { watch, setValue } = form;

  const feedAdditiveValue = watch("feedAdditive");
  const baselineFCRValue = watch("baselineFCR");

  useEffect(() => {
    if (feedAdditiveValue && baselineFCRValue > 0) {
      let reduction = 0;
      switch (feedAdditiveValue) {
        case "Jefo Pro Solution":
          reduction = 0.04;
          break;
        case "Jefo P(OA+EO)":
          reduction = 0.05;
          break;
        case "Jefo Xylanase":
          reduction = 0.06;
          break;
      }
      const newFCR = baselineFCRValue - reduction;
      setValue("feedConversionRatioAfter", parseFloat(newFCR.toFixed(3)), { shouldValidate: true });
    }
  }, [feedAdditiveValue, baselineFCRValue, setValue]);

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
            <CardTitle>1. Broiler Production Cycle</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numberOfBirds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birds per cycle</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50000" {...field} />
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
                    <Input type="number" step="0.01" placeholder="e.g., 2.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="mortalityRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mortality Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 4.5" {...field} />
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
                  <FormLabel>Baseline FCR</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 1.75" {...field} />
                  </FormControl>
                   <FormDescription>
                    Feed Conversion Ratio (before additive).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Feed & Performance</CardTitle>
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
                        </SelectTrigger>
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
            <FormField
              control={form.control}
              name="inclusionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inclusion Rate</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 1.5" {...field} />
                  </FormControl>
                  <FormDescription>In kg per ton of feed.</FormDescription>
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
                    <Input type="number" step="0.01" placeholder="e.g., 12.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Cost Metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="feedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feed Cost ($/ton)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 450" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="livestockPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Broiler Price ($/kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 2.10" {...field} />
                  </FormControl>
                  <FormDescription>
                    Price per kg of live weight.
                  </FormDescription>
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
