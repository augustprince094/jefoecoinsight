// src/ai/flows/calculate-roi.ts
'use server';
/**
 * @fileOverview A flow to calculate the return on investment (ROI) for feed additives in livestock production.
 *
 * - calculateROI - A function that calculates the ROI based on inputted data.
 * - ROIInput - The input type for the calculateROI function.
 * - ROIOutput - The return type for the calculateROI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ROIInputSchema = z.object({
  livestockType: z.enum(['broilers', 'layers', 'pigs', 'dairy cows']).describe('The type of livestock.'),
  feedAdditiveType: z.string().describe('The type of feed additive used.'),
  inclusionRate: z.number().describe('The inclusion rate of the feed additive.'),
  productionMetrics: z.object({
    feedConversionRatio: z.number().describe('The feed conversion ratio.'),
    eggProductionRate: z.number().optional().describe('The egg production rate (layers only).'),
    averageDailyGain: z.number().optional().describe('The average daily gain (broilers, pigs only).'),
    milkYield: z.number().optional().describe('The milk yield (dairy cows only).'),
  }).describe('Key production metrics for the livestock.'),
  costMetrics: z.object({
    feedCost: z.number().describe('The cost of feed per unit.'),
    additiveCost: z.number().describe('The cost of the feed additive per unit.'),
    livestockPrice: z.number().describe('The price of livestock product (e.g., meat, eggs, milk).'),
  }).describe('Cost metrics related to production.'),
});

export type ROIInput = z.infer<typeof ROIInputSchema>;

const ROIOutputSchema = z.object({
  roi: z.number().describe('The calculated return on investment (ROI).'),
  explanation: z.string().describe('An explanation of how the ROI was calculated.'),
});

export type ROIOutput = z.infer<typeof ROIOutputSchema>;

export async function calculateROI(input: ROIInput): Promise<ROIOutput> {
  return calculateROIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateROIPrompt',
  input: {schema: ROIInputSchema},
  output: {schema: ROIOutputSchema},
  prompt: `You are an expert in livestock economics and feed additives. Calculate the return on investment (ROI) for the given livestock production scenario.

Livestock Type: {{{livestockType}}}
Feed Additive Type: {{{feedAdditiveType}}}
Inclusion Rate: {{{inclusionRate}}}

Production Metrics:
Feed Conversion Ratio: {{{productionMetrics.feedConversionRatio}}}
{{#if productionMetrics.eggProductionRate}}Egg Production Rate: {{{productionMetrics.eggProductionRate}}}{{/if}}
{{#if productionMetrics.averageDailyGain}}Average Daily Gain: {{{productionMetrics.averageDailyGain}}}{{/if}}
{{#if productionMetrics.milkYield}}Milk Yield: {{{productionMetrics.milkYield}}}{{/if}}

Cost Metrics:
Feed Cost: {{{costMetrics.feedCost}}}
Additive Cost: {{{costMetrics.additiveCost}}}
Livestock Price: {{{costMetrics.livestockPrice}}}

Consider industry benchmarks and research data to estimate the potential improvements in production metrics due to the feed additive. Provide a clear explanation of your calculations and assumptions.

Return the ROI as a decimal number and provide detailed explanation.
`,
});

const calculateROIFlow = ai.defineFlow(
  {
    name: 'calculateROIFlow',
    inputSchema: ROIInputSchema,
    outputSchema: ROIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
