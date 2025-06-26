"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FormValues, LivestockType } from "@/lib/types";
import { formSchema, livestockTypes } from "@/lib/types";
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
import { Bird, Loader2 } from "lucide-react";
import { PigIcon } from "./icons/pig-icon";
import { CowIcon } from "./icons/cow-icon";
import React from "react";

const livestockIcons: Record<LivestockType, React.ReactNode> = {
  broilers: <Bird className="h-5 w-5 mr-2" />,
  layers: <Bird className="h-5 w-5 mr-2" />,
  pigs: <PigIcon className="h-5 w-5 mr-2" />,
  "dairy cows": <CowIcon className="h-5 w-5 mr-2" />,
};

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
      feedAdditive: "",
    },
  });
  const { toast } = useToast();

  const watchedLivestockType = form.watch("livestockType");

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

  const renderConditionalFields = () => {
    switch (watchedLivestockType) {
      case "broilers":
      case "pigs":
        return (
          <FormField
            control={form.control}
            name="averageDailyGain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average Daily Gain (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 0.08" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "layers":
        return (
          <FormField
            control={form.control}
            name="eggProductionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Egg Production Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 92.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "dairy cows":
        return (
          <FormField
            control={form.control}
            name="milkYield"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Milk Yield (liters/day)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 35.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Farm & Feed Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="livestockType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Livestock Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select livestock..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {livestockTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center">
                            {livestockIcons[type]}
                            <span className="capitalize">{type}</span>
                          </div>
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
              name="feedAdditive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feed Additive Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Probiotic X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Production Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="feedConversionRatioBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FCR (Before)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.75" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="feedConversionRatioAfter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FCR (After)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.68" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormDescription>
                Feed Conversion Ratio: kg of feed per kg of gain/product.
            </FormDescription>

            {renderConditionalFields()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Cost Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <FormField
              control={form.control}
              name="livestockPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Livestock Product Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 2.10" {...field} />
                  </FormControl>
                  <FormDescription>
                    $/kg for meat, $/dozen for eggs, $/liter for milk.
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
