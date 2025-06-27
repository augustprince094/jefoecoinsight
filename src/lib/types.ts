
import { z } from "zod";
import { type ROIOutput } from '@/ai/flows/calculate-roi';
import { type EstimateGHGSavingsOutput } from '@/ai/flows/estimate-ghg-savings';
import { type ProvideAdvisoryOutput } from '@/ai/flows/provide-advisory';

export const feedAdditiveTypes = ["Jefo Pro Solution", "Jefo P(OA+EO)", "Jefo Xylanase"] as const;
export type FeedAdditiveType = (typeof feedAdditiveTypes)[number];

export const applicationTypes = ["Matrix", "On-top"] as const;
export type ApplicationType = (typeof applicationTypes)[number];

export const formSchema = z.object({
  // Card 1: Broiler Production Cycle Details
  numberOfBirds: z.coerce.number().positive({ message: "Must be a positive number." }),
  broilerLiveWeight: z.coerce.number().positive({ message: "Must be a positive number." }),
  baselineMortalityRate: z.coerce.number().min(0, { message: "Cannot be negative." }).max(100, { message: "Cannot exceed 100." }),
  baselineFCR: z.coerce.number().positive({ message: "Must be a positive number." }),
  feedCost: z.coerce.number().positive({ message: "Must be a positive number." }),

  // Card 2: Feed & Performance
  feedAdditive: z.enum(feedAdditiveTypes, {
    required_error: "Please select a feed additive.",
  }),
  applicationType: z.enum(applicationTypes).optional(),
  inclusionRate: z.coerce.number().positive({ message: "Must be a positive number." }),
  additiveCost: z.coerce.number().positive({ message: "Must be a positive number." }),
  
  // Calculated fields
  feedConversionRatioAfter: z.coerce.number().positive({ message: "Must be a positive number." }),
  mortalityRateAfter: z.coerce.number().min(0, { message: "Cannot be negative." }),
});


export type FormValues = z.infer<typeof formSchema>;

export type OptimizationResult = {
  roiData: ROIOutput;
  ghgData: EstimateGHGSavingsOutput;
  advisoryData: ProvideAdvisoryOutput;
  inputs: FormValues;
};
