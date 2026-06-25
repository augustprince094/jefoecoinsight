import { z } from "zod";

// Broiler-specific constants
export const broilerFeedAdditiveTypes = [
  "Jefo Pro Solution",
  "Jefo P(OA+EO)",
  "Jefo Xylanase",
] as const;
export const broilerRegions = [
  "North America (CA)",
  "Asia (PH)",
  "Europe (FR)",
  "Latin America (BR)",
] as const;

// Dairy-specific constants
export const dairyFeedAdditiveTypes = [
  "Lactation VB",
  "Transition VB",
] as const;

export const dairyRegions = [
  "Canada",
  "United States",
  "Mexico",
  "Chile",
  "Colombia",
  "France",
  "Australia",
] as const;

export const regionSettings = {
  // Broiler Regions
  "North America (CA)": { currency: "USD", symbol: "$" },
  "Asia (PH)": { currency: "PHP", symbol: "₱" },
  "Europe (FR)": { currency: "EUR", symbol: "€" },
  "Latin America (BR)": { currency: "BRL", symbol: "R$" },

  // Dairy Regions
  Canada: { currency: "CAD", symbol: "$" },
  "United States": { currency: "USD", symbol: "$" },
  Mexico: { currency: "MXN", symbol: "$" },
  Chile: { currency: "CLP", symbol: "$" },
  Colombia: { currency: "COP", symbol: "$" },
  France: { currency: "EUR", symbol: "€" },
  Australia: { currency: "AUD", symbol: "$" },
} as const;
export type Region = keyof typeof regionSettings;

// Shared constants
export const applicationTypes = ["Matrix", "On-top"] as const;
export type ApplicationType = (typeof applicationTypes)[number];

export const dietPhases = ["Starter", "Grower", "Finisher"] as const;
export type DietPhase = (typeof dietPhases)[number];

const requiredNumber = (fieldName: string) =>
  z.coerce
    .number({
      required_error: `${fieldName} is required.`,
      invalid_type_error: `${fieldName} must be a number.`,
    })
    .positive({ message: `${fieldName} must be a positive number.` });

const broilerSchema = z.object({
  numberOfBirds: requiredNumber("Number of birds"),
  broilerLiveWeight: requiredNumber("Broiler live weight"),
  baselineMortalityRate: requiredNumber("Baseline mortality rate")
    .min(0)
    .max(100),
  baselineFCR: requiredNumber("Baseline FCR"),
  feedCost: requiredNumber("Feed cost"),
  additiveCost: requiredNumber("Additive cost"),
});

const dairySchema = z.object({
  numberOfBirds: requiredNumber("Herd size"),
  broilerLiveWeight: requiredNumber("Current milk yield"),
  baselineMortalityRate: requiredNumber("Baseline cull rate").min(0).max(100),
  milkPrice: requiredNumber("Milk price"),
  daysInMilk: requiredNumber("Days in milk"),
  additiveCost: requiredNumber("Additive cost"),
});

export const formSchema = (isDairy: boolean) => {
  const baseSchema = z.object({
    region: z.string({
      required_error: "Please select a region.",
    }),
    feedAdditive: z.string({
      required_error: "Please select a feed additive.",
    }),
    applicationType: z.enum(applicationTypes).optional(),
    dietPhase: z.enum(dietPhases).optional(),
    inclusionRate: z.coerce
      .number()
      .positive({ message: "Must be a positive number." }),
    feedConversionRatioAfter: z.coerce.number(),
    mortalityRateAfter: z.coerce
      .number()
      .min(0, { message: "Cannot be negative." }),

    // These fields are conditionally required but need to be in the base for type inference
    baselineFCR: z.coerce.number().optional(),
    feedCost: z.coerce.number().optional(),
    milkPrice: z.coerce.number().optional(),
    daysInMilk: z.coerce.number().optional(),
  });

  return isDairy
    ? baseSchema.merge(dairySchema)
    : baseSchema.merge(broilerSchema);
};

export type FormValues = z.infer<ReturnType<typeof formSchema>>;
