
import { z } from "zod";
import { type ROIOutput } from '@/ai/flows/calculate-roi';
import { type EstimateGHGSavingsOutput } from '@/ai/flows/estimate-ghg-savings';
import { type ProvideAdvisoryOutput } from '@/ai/flows/provide-advisory';

// Broiler-specific constants
export const broilerFeedAdditiveTypes = ["Jefo Pro Solution", "Jefo P(OA+EO)", "Jefo Xylanase"] as const;
export const broilerRegions = ["North America (CA)", "Asia (PH)", "Europe (FR)", "Latin America (BR)"] as const;

// Dairy-specific constants
export const dairyFeedAdditiveTypes = ["Lactation VB", "Transition VB"] as const;
export const dairyRegions = ["Canada", "United States", "Mexico", "Chile", "Colombia", "France", "Australia"] as const;

export const regionSettings = {
    // Broiler Regions
    "North America (CA)": { currency: "USD", symbol: "$" },
    "Asia (PH)": { currency: "PHP", symbol: "₱" },
    "Europe (FR)": { currency: "EUR", symbol: "€" },
    "Latin America (BR)": { currency: "BRL", symbol: "R$" },
    // Dairy Regions
    "Canada": { currency: "CAD", symbol: "$" },
    "United States": { currency: "USD", symbol: "$" },
    "Mexico": { currency: "MXN", symbol: "$" },
    "Chile": { currency: "CLP", symbol: "$" },
    "Colombia": { currency: "COP", symbol: "$" },
    "France": { currency: "EUR", symbol: "€" },
    "Australia": { currency: "AUD", symbol: "$" },
} as const;
export type Region = keyof typeof regionSettings;


// Shared constants
export const applicationTypes = ["Matrix", "On-top"] as const;
export type ApplicationType = (typeof applicationTypes)[number];

export const dietPhases = ["Starter", "Grower", "Finisher"] as const;
export type DietPhase = (typeof dietPhases)[number];

export const formSchema = (defaults: Partial<FormValues>) => z.object({
  region: z.string({
    required_error: "Please select a region.",
  }),
  numberOfBirds: z.coerce.number({invalid_type_error: "Must be a number."}).positive({ message: "Must be a positive number." }).optional(),
  broilerLiveWeight: z.coerce.number({invalid_type_error: "Must be a number."}).positive({ message: "Must be a positive number." }).optional(),
  baselineMortalityRate: z.coerce.number({invalid_type_error: "Must be a number."}).min(0, { message: "Must be between 0 and 100." }).max(100, { message: "Must be between 0 and 100." }).optional(),
  baselineFCR: z.coerce.number({invalid_type_error: "Must be a number."}).positive({ message: "Must be a positive number." }).optional(),
  feedCost: z.coerce.number({invalid_type_error: "Must be a number."}).positive({ message: "Must be a positive number." }).optional(),
  feedAdditive: z.string({
    required_error: "Please select a feed additive.",
  }),
  applicationType: z.enum(applicationTypes).optional(),
  dietPhase: z.enum(dietPhases).optional(),
  inclusionRate: z.coerce.number().positive({ message: "Must be a positive number." }),
  additiveCost: z.coerce.number({invalid_type_error: "Must be a number."}).positive({ message: "Must be a positive number." }).optional(),
  feedConversionRatioAfter: z.coerce.number(),
  mortalityRateAfter: z.coerce.number().min(0, { message: "Cannot be negative." }),
  // Dairy specific fields
  milkPrice: z.coerce.number({invalid_type_error: "Must be a number."}).optional(),
  daysInMilk: z.coerce.number({invalid_type_error: "Must be a number."}).optional(),
});


export type FormValues = z.infer<ReturnType<typeof formSchema>>;

export type OptimizationResult = {
  roiData: ROIOutput;
  ghgData: EstimateGHGSavingsOutput;
  advisoryData: ProvideAdvisoryOutput;
  inputs: FormValues;
};
