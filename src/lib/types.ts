import { z } from "zod";
import { type ROIOutput } from '@/ai/flows/calculate-roi';
import { type EstimateGHGSavingsOutput } from '@/ai/flows/estimate-ghg-savings';

export const livestockTypes = ["broilers", "layers", "pigs", "dairy cows"] as const;
export type LivestockType = (typeof livestockTypes)[number];

export const formSchema = z.object({
  livestockType: z.enum(livestockTypes, { 
    required_error: "Please select a livestock type." 
  }),
  feedAdditive: z.string().min(1, "Feed additive type is required."),
  inclusionRate: z.coerce.number().positive({ message: "Must be a positive number." }),

  feedConversionRatioBefore: z.coerce.number().positive({ message: "Must be a positive number." }),
  feedConversionRatioAfter: z.coerce.number().positive({ message: "Must be a positive number." }),
  
  averageDailyGain: z.coerce.number().optional(),
  eggProductionRate: z.coerce.number().optional(),
  milkYield: z.coerce.number().optional(),

  feedCost: z.coerce.number().positive({ message: "Must be a positive number." }),
  additiveCost: z.coerce.number().positive({ message: "Must be a positive number." }),
  livestockPrice: z.coerce.number().positive({ message: "Must be a positive number." }),
})
.refine(data => {
    if (data.livestockType === 'broilers' || data.livestockType === 'pigs') {
        return data.averageDailyGain !== undefined && data.averageDailyGain > 0;
    }
    return true;
}, {
    message: "Average daily gain is required for broilers and pigs.",
    path: ["averageDailyGain"],
})
.refine(data => {
    if (data.livestockType === 'layers') {
        return data.eggProductionRate !== undefined && data.eggProductionRate > 0;
    }
    return true;
}, {
    message: "Egg production rate is required for layers.",
    path: ["eggProductionRate"],
})
.refine(data => {
    if (data.livestockType === 'dairy cows') {
        return data.milkYield !== undefined && data.milkYield > 0;
    }
    return true;
}, {
    message: "Milk yield is required for dairy cows.",
    path: ["milkYield"],
});


export type FormValues = z.infer<typeof formSchema>;

export type OptimizationResult = {
  roiData: ROIOutput;
  ghgData: EstimateGHGSavingsOutput;
  inputs: FormValues;
};
