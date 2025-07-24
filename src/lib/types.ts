
import { z } from "zod";
import { type ROIOutput } from '@/ai/flows/calculate-roi';
import { type EstimateGHGSavingsOutput } from '@/ai/flows/estimate-ghg-savings';
import { type ProvideAdvisoryOutput } from '@/ai/flows/provide-advisory';

// Broiler-specific constants
export const broilerFeedAdditiveTypes = ["Jefo Pro Solution", "Jefo P(OA+EO)", "Jefo Xylanase"] as const;
export const broilerRegions = ["North America (CA)", "Asia (PH)", "Europe (FR)"] as const;

// Dairy-specific constants
export const dairyFeedAdditiveTypes = ["Lactation VB", "Transition VB"] as const;
export const dairyRegions = ["Canada", "United States", "Mexico", "Chile", "Colombia", "France", "Australia"] as const;


// Shared constants
export const applicationTypes = ["Matrix", "On-top"] as const;
export type ApplicationType = (typeof applicationTypes)[number];

export const dietPhases = ["Starter", "Grower", "Finisher"] as const;
export type DietPhase = (typeof dietPhases)[number];

export const formSchema = z.object({
  region: z.string({
    required_error: "Please select a region.",
  }),
  numberOfBirds: z.coerce.number().positive({ message: "Must be a positive number." }),
  broilerLiveWeight: z.coerce.number().positive({ message: "Must be a positive number." }),
  baselineMortalityRate: z.coerce.number().min(0, { message: "Cannot be negative." }).max(100, { message: "Cannot exceed 100." }),
  baselineFCR: z.coerce.number().positive({ message: "Must be a positive number." }),
  feedCost: z.coerce.number().positive({ message: "Must be a positive number." }),
  feedAdditive: z.string({
    required_error: "Please select a feed additive.",
  }),
  applicationType: z.enum(applicationTypes).optional(),
  dietPhase: z.enum(dietPhases).optional(),
  inclusionRate: z.coerce.number().positive({ message: "Must be a positive number." }),
  additiveCost: z.coerce.number().positive({ message: "Must be a positive number." }),
  feedConversionRatioAfter: z.coerce.number(),
  mortalityRateAfter: z.coerce.number().min(0, { message: "Cannot be negative." }),
});


export type FormValues = z.infer<typeof formSchema>;

export type OptimizationResult = {
  roiData: ROIOutput;
  ghgData: EstimateGHGSavingsOutput;
  advisoryData: ProvideAdvisoryOutput;
  inputs: FormValues;
};
