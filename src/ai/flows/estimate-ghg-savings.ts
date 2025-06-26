// estimate-ghg-savings.ts

'use server';

/**
 * @fileOverview GHG emission reductions estimator AI agent.
 *
 * - estimateGHGSavings - A function that estimates the greenhouse gas (GHG) emission reductions.
 * - EstimateGHGSavingsInput - The input type for the estimateGHGSavings function.
 * - EstimateGHGSavingsOutput - The return type for the estimateGHGSavings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateGHGSavingsInputSchema = z.object({
  livestockType: z.enum(['broilers', 'layers', 'pigs', 'dairy cows']).describe('The type of livestock.'),
  feedAdditive: z.string().describe('The type of feed additive used.'),
  inclusionRate: z.number().describe('The inclusion rate of the feed additive (e.g., in kg/ton).'),
  feedConversionRatioBefore: z.number().describe('The feed conversion ratio before using the additive.'),
  feedConversionRatioAfter: z.number().describe('The feed conversion ratio after using the additive.'),
  productionMetrics: z.string().describe('Key production metrics of livestock'),
  costMetrics: z.string().describe('Cost metrics associated with livestock production'),
});
export type EstimateGHGSavingsInput = z.infer<typeof EstimateGHGSavingsInputSchema>;

const EstimateGHGSavingsOutputSchema = z.object({
  ghgSavings: z.number().describe('The estimated greenhouse gas emission reductions (e.g., in kg CO2e).'),
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
  prompt: `You are an expert in estimating greenhouse gas (GHG) emission reductions in livestock production.

  Based on the provided information, estimate the GHG emission reductions resulting from the use of a feed additive.
  Consider factors such as improved feed efficiency (feed conversion ratio), reduced waste, and any other relevant aspects.

  Livestock Type: {{{livestockType}}}
  Feed Additive: {{{feedAdditive}}}
  Inclusion Rate: {{{inclusionRate}}}
  Feed Conversion Ratio Before: {{{feedConversionRatioBefore}}}
  Feed Conversion Ratio After: {{{feedConversionRatioAfter}}}
  Production Metrics: {{{productionMetrics}}}
  Cost Metrics: {{{costMetrics}}}

  Provide both the estimated GHG savings and a brief explanation of your calculation.
  Ensure that the units for ghgSavings are in kg CO2e.
  The explanation is important for the user to understand how the savings were derived.
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
