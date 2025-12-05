
'use server';
/**
 * @fileOverview An AI flow to provide expert advisory based on calculator results.
 *
 * - provideAdvisory - A function that generates a textual summary and advice.
 * - ProvideAdvisoryInput - The input type for the provideAdvisory function.
 * - ProvideAdvisoryOutput - The return type for the provideAdvisory function.
 */

import {z} from 'genkit';

const AdvisoryInputSchema = z.object({
  inputs: z.object({
    feedAdditive: z.string(),
    applicationType: z.string().optional(),
    numberOfBirds: z.number(),
  }),
  roiData: z.object({
    roi: z.number(),
    feedCostSavings: z.number(),
  }),
  ghgData: z.object({
    ghgSavings: z.number().describe('The total GHG savings in tons CO2e.'),
  }),
});
export type ProvideAdvisoryInput = z.infer<typeof AdvisoryInputSchema>;

const ProvideAdvisoryOutputSchema = z.object({
  keyBenefit: z.string().describe('A single, concise key benefit of the selected additive.'),
});
export type ProvideAdvisoryOutput = z.infer<typeof ProvideAdvisoryOutputSchema>;

const keyBenefits = {
  'Jefo Pro Solution': {
    'Matrix': "Jefo Pro Solution can reduce feed cost without compromising performance when added to broiler diets containing either traditional or alternative feed ingredients and formulated based on its recommended nutrition matrix.",
    'On-top': "During heat stress situations, the use of Jefo Pro Solution, both in regular feeds and low density feeds, drastically reduces total mortality."
  },
  'Jefo P(OA+EO)': {
    'On-top': "The use of Jefo P(OA+EO) is an efficient strategy to reduce Salmonella Typhimurium counts in broiler chickens."
  },
  'Jefo Xylanase': {
    'Matrix': "Jefo Xylanase can be used in reduced energy corn-soybean based diets to improve growth performance and reduce cost of broiler diets.",
    'On-top': "Jefo Xylanase is a reliable solution for better performance, improves footpad quality and economic returns."
  }
};

export async function provideAdvisory(input: ProvideAdvisoryInput): Promise<ProvideAdvisoryOutput> {
  const { feedAdditive, applicationType } = input.inputs;

  let benefit = "Jefo feed additives provide significant performance and economic benefits."; // Default fallback

  const additiveBenefits = keyBenefits[feedAdditive as keyof typeof keyBenefits];
  if (additiveBenefits) {
    // For additives with only one application type (like Jefo P(OA+EO)), or if type is not specified
    const appType = applicationType as keyof typeof additiveBenefits || 'On-top';
    benefit = additiveBenefits[appType] || Object.values(additiveBenefits)[0];
  }

  return {
    keyBenefit: benefit
  };
}
