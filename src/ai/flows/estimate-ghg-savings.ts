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
  mortalityRate: z.number().describe('The mortality rate as a percentage.'),
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

  Based on the provided information, estimate the GHG emission reductions resulting from the use of a feed additive. The primary saving comes from improved feed efficiency.

  Scenario Details:
  - Livestock Type: Broilers
  - Number of birds per cycle: {{{numberOfBirds}}}
  - Target live weight per broiler: {{{broilerLiveWeight}}} kg
  - Mortality rate: {{{mortalityRate}}} %
  - Feed Conversion Ratio Before: {{{feedConversionRatioBefore}}}
  - Feed Conversion Ratio After: {{{feedConversionRatioAfter}}}

  Feed Additive Details:
  - Type: {{{feedAdditive}}}

  Calculate the total feed saved due to the improved FCR for the entire production cycle. Then, use standard emission factors for feed production to estimate the total GHG savings in kg CO2e. Assume an emission factor of 1.2 kg CO2e per kg of broiler feed produced.

  Calculation Steps:
  1. Calculate total final birds = Number of birds * (1 - mortality rate / 100).
  2. Calculate total live weight produced = Total final birds * Broiler live weight.
  3. Calculate total feed consumed Before = Total live weight * FCR Before.
  4. Calculate total feed consumed After = Total live weight * FCR After.
  5. Calculate total feed saved = Total feed consumed Before - Total feed consumed After.
  6. Calculate GHG Savings = Total feed saved * 1.2 kg CO2e/kg feed.

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
