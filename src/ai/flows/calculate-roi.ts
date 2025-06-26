
// src/ai/flows/calculate-roi.ts
'use server';
/**
 * @fileOverview A flow to calculate the return on investment (ROI) for feed additives in broiler production.
 *
 * - calculateROI - A function that calculates the ROI based on inputted data.
 * - ROIInput - The input type for the calculateROI function.
 * - ROIOutput - The return type for the calculateROI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ROIInputSchema = z.object({
  feedAdditiveType: z.string().describe('The type of feed additive used.'),
  inclusionRate: z.number().describe('The inclusion rate of the feed additive in kg/ton.'),
  numberOfBirds: z.number().describe('Number of birds per production cycle.'),
  broilerLiveWeight: z.number().describe('The final live weight of a broiler in kg.'),
  mortalityRate: z.number().describe('The mortality rate as a percentage (e.g., 4.5 for 4.5%).'),
  feedConversionRatioBefore: z.number().describe('The feed conversion ratio before using the additive.'),
  feedConversionRatioAfter: z.number().describe('The feed conversion ratio after using the additive.'),
  costMetrics: z.object({
    feedCost: z.number().describe('The cost of feed to produce 1kg of live weight, before using the additive, in $.'),
    additiveCost: z.number().describe('The cost of the feed additive in $/kg.'),
  }).describe('Cost metrics related to production.'),
});

export type ROIInput = z.infer<typeof ROIInputSchema>;

const ROIOutputSchema = z.object({
  roi: z.number().describe('The calculated return on investment (ROI) as a decimal ratio to 1.'),
  explanation: z.string().describe('An explanation of how the ROI was calculated, showing the steps.'),
  feedCostPerLiveWeightBefore: z.number().describe('The feed cost per kg of live weight before the additive, in $.'),
  feedCostPerLiveWeightAfter: z.number().describe('The feed cost per kg of live weight after using the additive, in $.'),
});

export type ROIOutput = z.infer<typeof ROIOutputSchema>;

export async function calculateROI(input: ROIInput): Promise<ROIOutput> {
  return calculateROIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateROIPrompt',
  input: {schema: ROIInputSchema},
  output: {schema: ROIOutputSchema},
  prompt: `You are an expert in broiler economics. Calculate the return on investment (ROI) for using a feed additive, based on the feed cost savings versus the investment in the additive.

Scenario Details:
- Number of birds per cycle: {{{numberOfBirds}}}
- Target live weight per broiler: {{{broilerLiveWeight}}} kg
- Mortality rate: {{{mortalityRate}}} %
- Feed Conversion Ratio (FCR) Before: {{{feedConversionRatioBefore}}}
- FCR After: {{{feedConversionRatioAfter}}}

Feed Additive Details:
- Type: {{{feedAdditiveType}}}
- Inclusion Rate: {{{inclusionRate}}} kg/ton

Cost Metrics:
- Feed Cost (before additive): \${{{costMetrics.feedCost}}} per kg of live weight
- Additive Cost: \${{{costMetrics.additiveCost}}} per kg

Your calculation should only consider the feed cost savings and the cost of the additive. Do not consider the revenue from selling broilers.
Show your work in the explanation. Follow these steps:
1. First, calculate the cost of feed per ton. The provided feed cost is per kg of live weight *before* the additive. Use the baseline FCR to find the cost per ton. Formula: Feed Cost per ton = (Feed Cost per kg live weight / FCR Before) * 1000.
2. Calculate total final birds = Number of birds * (1 - mortality rate / 100).
3. Calculate total live weight produced = Total final birds * Broiler live weight.
4. Calculate total feed consumed for both scenarios (Before and After) = Total live weight * FCR.
5. Calculate total feed cost for both scenarios using the calculated Feed Cost per ton from step 1.
6. Calculate the total feed cost savings = Total Feed Cost Before - Total Feed Cost After.
7. Calculate the total investment in the additive = (Total feed consumed After / 1000) * inclusion rate * additive cost.
8. Calculate ROI = (Total Feed Cost Savings / Total Investment in Additive).
9. Calculate the feed cost per kg of live weight for the 'After' scenario by dividing the 'Total Feed Cost After' from step 5 by the 'Total live weight produced' from step 3.

Return the ROI as a decimal number (e.g., 1.5 for 1.5:1).
Return the 'feedCostPerLiveWeightBefore' using the value from the input 'costMetrics.feedCost'.
Return the calculated 'feedCostPerLiveWeightAfter' from step 9.
Provide a detailed step-by-step explanation of the calculation.
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
