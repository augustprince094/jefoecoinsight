// estimate-ghg-savings.ts
'use server';

/**
 * @fileOverview GHG emission reductions estimator AI agent for broiler production.
 *
 * - estimateGHGSavings - A function that estimates the greenhouse gas (GHG) emission reductions.
 * - EstimateGHGSavingsInput - The input type for the estimateGHGSavings function.
 * - EstimateGHGSavingsOutput - The return type for the estimateGHGSavings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateGHGSavingsInputSchema = z.object({
  feedAdditive: z.string().describe('The type of feed additive used.'),
  inclusionRate: z.number().describe('The inclusion rate of the feed additive (e.g., in kg/ton).'),
  numberOfBirds: z.number().describe('Number of birds per production cycle.'),
  broilerLiveWeight: z.number().describe('The final live weight of a broiler in kg.'),
  mortalityRateBefore: z.number().describe('The mortality rate before using the additive, as a percentage.'),
  mortalityRateAfter: z.number().describe('The mortality rate after using the additive, as a percentage.'),
  feedConversionRatioBefore: z.number().describe('The feed conversion ratio before using the additive.'),
  feedConversionRatioAfter: z.number().describe('The feed conversion ratio after using the additive.'),
});
export type EstimateGHGSavingsInput = z.infer<typeof EstimateGHGSavingsInputSchema>;

const EstimateGHGSavingsOutputSchema = z.object({
  ghgSavings: z.number().describe('The estimated greenhouse gas emission reductions in kg CO2e.'),
  explanation: z.string().describe('An explanation of how the GHG savings were estimated.'),
});
export type EstimateGHGSavingsOutput = z.infer<typeof EstimateGHGSavingsOutputSchema>;

export async function estimateGHGSavings(input: EstimateGHGSavingsInput): Promise<EstimateGHGSavingsOutput> {
  return estimateGHGSavingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateGHGSavingsPrompt',
  input: {schema: EstimateGHGSavingsInputSchema},
  output: {schema: EstimateGHGSavingsOutputSchema},
  prompt: `You are an expert in estimating greenhouse gas (GHG) emission reductions in broiler production.

  Based on the provided information, estimate the GHG emission reductions resulting from the use of a feed additive. The savings come from improved feed efficiency and reduced mortality. The calculation must account for feed consumed by both surviving birds and birds that die during the cycle. Birds that die are assumed to consume 30% of the feed that a full-grown bird would have consumed.

  Scenario Details:
  - Livestock Type: Broilers
  - Number of birds per cycle: {{{numberOfBirds}}}
  - Target live weight per broiler: {{{broilerLiveWeight}}} kg
  
  Baseline Scenario (Before Additive):
  - Mortality rate: {{{mortalityRateBefore}}} %
  - Feed Conversion Ratio (FCR): {{{feedConversionRatioBefore}}}
  
  New Scenario (After Additive):
  - Mortality rate: {{{mortalityRateAfter}}} %
  - Feed Conversion Ratio (FCR): {{{feedConversionRatioAfter}}}

  Feed Additive Details:
  - Type: {{{feedAdditive}}}

  Calculation Steps:
  1.  For **both** the 'Before' and 'After' scenarios, calculate the total feed consumed using the following sub-steps:
      a. Calculate the number of surviving birds and dead birds.
      b. Calculate total live weight produced by surviving birds.
      c. Calculate total feed consumed by surviving birds (Total Live Weight * FCR).
      d. Calculate total feed consumed by dead birds (Dead Birds * (Broiler live weight * FCR * 0.30)).
      e. Sum the feed from survivors and dead birds to get the total feed consumed for the scenario.
  2.  Calculate total feed saved = Total Feed Consumed (Before) - Total Feed Consumed (After).
  3.  Calculate GHG Savings = Total feed saved * 1.2 kg CO2e/kg feed.

  Provide both the estimated GHG savings and a brief explanation of your calculation.
  Ensure that the units for ghgSavings are in kg CO2e.
  `,
});

const estimateGHGSavingsFlow = ai.defineFlow(
  {
    name: 'estimateGHGSavingsFlow',
    inputSchema: EstimateGHGSavingsInputSchema,
    outputSchema: EstimateGHGSavingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
