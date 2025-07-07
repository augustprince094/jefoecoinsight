
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
import {z} from 'zod';
import { feedData } from '@/lib/feed-data';

const ROIInputSchema = z.object({
  region: z.string().describe('The region of operation.'),
  applicationType: z.string().optional().describe('The application type (Matrix or On-top).'),
  feedAdditiveType: z.string().describe('The type of feed additive used.'),
  inclusionRate: z.number().describe('The inclusion rate of the feed additive in kg/ton.'),
  numberOfBirds: z.number().describe('Number of birds per production cycle.'),
  broilerLiveWeight: z.number().describe('The final live weight of a broiler in kg.'),
  mortalityRateBefore: z.number().describe('The mortality rate before using the additive, as a percentage.'),
  mortalityRateAfter: z.number().describe('The mortality rate after using the additive, as a percentage.'),
  feedConversionRatioBefore: z.number().describe('The feed conversion ratio before using the additive.'),
  feedConversionRatioAfter: z.number().describe('The feed conversion ratio after using the additive.'),
  costMetrics: z.object({
    feedCost: z.number().describe('The cost per kg of feed, in $.'),
    additiveCost: z.number().describe('The cost of the feed additive in $/kg.'),
  }).describe('Cost metrics related to production.'),
});

export type ROIInput = z.infer<typeof ROIInputSchema>;

const ROIOutputSchema = z.object({
  roi: z.number().describe('The calculated return on investment (ROI) as a decimal ratio to 1.'),
  explanation: z.string().describe('An explanation of how the ROI was calculated, showing the steps.'),
  feedCostPerLiveWeightBefore: z.number().describe('The feed cost per kg of live weight before the additive, in $.'),
  feedCostPerLiveWeightAfter: z.number().describe('The feed cost per kg of live weight after using the additive, in $.'),
  feedCostSavings: z.number().describe('The total feed cost savings in $.'),
  baselineCostPerTon: z.number().optional().describe('The baseline feed cost per ton in $.'),
  reformulatedCostPerTon: z.number().optional().describe('The reformulated feed cost per ton in $.'),
});

export type ROIOutput = z.infer<typeof ROIOutputSchema>;

export async function calculateROI(input: ROIInput): Promise<ROIOutput> {
  return calculateROIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateROIPrompt',
  input: {schema: ROIInputSchema},
  output: {schema: ROIOutputSchema},
  prompt: `You are an expert in broiler economics. Calculate the return on investment (ROI) for using a feed additive with an 'On-top' application.

The calculation must use the following formula for total cost, which accounts for mortality:
Total Feed Cost = (Number of Birds * FCR * Live Weight * Cost per kg of Feed) / (1 - (Mortality Rate / 100))

Scenario Details:
- Number of birds per cycle: {{{numberOfBirds}}}
- Target live weight per broiler: {{{broilerLiveWeight}}} kg

Baseline Scenario (Before Additive):
- Mortality rate: {{{mortalityRateBefore}}} %
- Feed Conversion Ratio (FCR): {{{feedConversionRatioBefore}}}

New Scenario (After Additive):
- Mortality rate: {{{mortalityRateAfter}}} %
- Feed Conversion Ratio (FCR): {{{feedConversionRatioAfter}}}

Feed Additive Details:
- Type: {{{feedAdditiveType}}}
- Inclusion Rate: {{{inclusionRate}}} kg/ton

Cost Metrics:
- Cost per kg of Feed: \${{{costMetrics.feedCost}}}
- Additive Cost: \${{{costMetrics.additiveCost}}} per kg

Your calculation should only consider the feed cost savings and the cost of the additive. Do not consider the revenue from selling broilers.

Show your work in the explanation. Follow these steps:
1.  Use the provided 'Cost per kg of Feed' from the input. This is constant for the baseline feed in both scenarios.
2.  Calculate the total feed cost for the 'Before' scenario using the formula.
3.  Calculate the total feed cost for the 'After' scenario using the formula (this does NOT include the additive cost yet).
4.  Calculate the total feed cost savings = Total Feed Cost Before - Total Feed Cost After.
5.  Calculate the total feed consumed for the 'After' scenario. Formula: Total Feed Consumed After = (Number of Birds * FCR After * Live Weight) / (1 - (Mortality Rate After / 100)).
6.  Calculate the total investment in the additive = (Total Feed Consumed After / 1000) * inclusion rate * additive cost.
7.  Calculate ROI = (Total Feed Cost Savings / Total Investment in Additive).
8.  Calculate the feed cost per kg live weight for both 'Before' and 'After' scenarios.
    - For 'Before':
      a. Take the 'Total Feed Cost Before' calculated in step 2.
      b. Calculate 'Total Live Weight Produced Before' = Number of Birds * (1 - (Mortality Rate Before / 100)) * {{{broilerLiveWeight}}}.
      c. Calculate 'Feed Cost per kg Live Weight Before' = Total Feed Cost Before / Total Live Weight Produced Before. Store this in the 'feedCostPerLiveWeightBefore' output field.
    - For 'After':
      a. Take the 'Total Feed Cost After' from step 3.
      b. Take the 'Total Investment in Additive' from step 6.
      c. Calculate 'Total Production Cost After' = Total Feed Cost After + Total Investment in Additive.
      d. Calculate 'Total Live Weight Produced After' = Number of Birds * (1 - (Mortality Rate After / 100)) * {{{broilerLiveWeight}}}.
      e. Calculate 'Feed Cost per kg Live Weight After' = Total Production Cost After / Total Live Weight Produced After. Store this in the 'feedCostPerLiveWeightAfter' output field.

Return the ROI as a decimal number (e.g., 1.5 for 1.5:1).
Return the calculated 'feedCostPerLiveWeightBefore' from step 8.
Return the calculated 'feedCostPerLiveWeightAfter' from step 8.
Return the total feed cost savings from step 4 in the 'feedCostSavings' field.
Provide a detailed step-by-step explanation of the calculation.
`,
});

const calculateROIFlow = ai.defineFlow(
  {
    name: 'calculateROIFlow',
    inputSchema: ROIInputSchema,
    outputSchema: ROIOutputSchema,
  },
  async (input) => {
    if (input.applicationType === 'Matrix' && input.feedAdditiveType === 'Jefo Pro Solution') {
      const regionFeed = feedData.find(d => d.region === input.region);
      if (!regionFeed) {
        throw new Error(`Feed data for region ${input.region} not found.`);
      }

      const baselineCostPerTon = regionFeed.ingredients.reduce((total, ing) => {
        return total + (ing.quantity / 1000) * ing.cost;
      }, 0);
      
      const reformulatedIngredients = regionFeed.ingredients.map(ing => {
        let newQuantity = ing.quantity;
        // The reformulation logic is based on the user request.
        // It's currently the same for all regions as no other logic was provided.
        switch (ing.name) {
          case 'Corn': newQuantity *= 1.031; break;
          case 'Soybean Meal': newQuantity *= (1 - 0.045); break;
          case 'Soybean Oil': newQuantity *= (1 - 0.06); break;
          case 'Synthetic Amino Acid': newQuantity *= (1 - 0.031); break;
          case 'Other Raw Materials': newQuantity *= 1.007; break;
        }
        return { ...ing, quantity: newQuantity };
      });
      
      const reformulatedCostPerTon = reformulatedIngredients.reduce((total, ing) => {
        return total + (ing.quantity / 1000) * ing.cost;
      }, 0);
      
      const totalFeedConsumedAfter = (input.numberOfBirds * input.feedConversionRatioAfter * input.broilerLiveWeight) / (1 - (input.mortalityRateAfter / 100));
      const totalFeedConsumedAfterInTons = totalFeedConsumedAfter / 1000;
      
      const feedCostSavings = (baselineCostPerTon - reformulatedCostPerTon) * totalFeedConsumedAfterInTons;
      const totalInvestmentInAdditive = totalFeedConsumedAfterInTons * input.inclusionRate * input.costMetrics.additiveCost;
      
      const roi = totalInvestmentInAdditive > 0 ? feedCostSavings / totalInvestmentInAdditive : Infinity;
      
      const totalFeedCostAfter = totalFeedConsumedAfterInTons * reformulatedCostPerTon;
      const totalFeedCostBefore = ((input.numberOfBirds * input.feedConversionRatioBefore * input.broilerLiveWeight) / (1 - (input.mortalityRateBefore / 100))) / 1000 * baselineCostPerTon;

      const totalLiveWeightAfter = input.numberOfBirds * (1 - (input.mortalityRateAfter / 100) / 100) * input.broilerLiveWeight;
      const totalLiveWeightBefore = input.numberOfBirds * (1 - (input.mortalityRateBefore / 100) / 100) * input.broilerLiveWeight;

      const feedCostPerLiveWeightAfter = totalLiveWeightAfter > 0 ? (totalFeedCostAfter + totalInvestmentInAdditive) / totalLiveWeightAfter : 0;
      const feedCostPerLiveWeightBefore = totalLiveWeightBefore > 0 ? totalFeedCostBefore / totalLiveWeightBefore : 0;
      
      const explanation = `For a 'Matrix' application with ${input.feedAdditiveType}, savings are calculated from feed reformulation:\n\n` +
        `1. Baseline Feed Cost: The cost for the standard feed in ${input.region} is $${baselineCostPerTon.toFixed(2)} per ton.\n` +
        `2. Reformulated Feed Cost: With the additive, the new feed cost is $${reformulatedCostPerTon.toFixed(2)} per ton.\n` +
        `3. Saving per Ton: $${(baselineCostPerTon - reformulatedCostPerTon).toFixed(2)}.\n` +
        `4. Total Feed Consumed: ${totalFeedConsumedAfterInTons.toFixed(2)} tons.\n` +
        `5. Total Feed Cost Savings: $${feedCostSavings.toFixed(2)}.\n` +
        `6. Total Additive Investment: $${totalInvestmentInAdditive.toFixed(2)}.\n` +
        `7. Return on Investment (ROI): The final ROI is ${roi.toFixed(1)}:1.`;
      
      return {
        roi: roi,
        explanation: explanation,
        feedCostPerLiveWeightBefore: feedCostPerLiveWeightBefore,
        feedCostPerLiveWeightAfter: feedCostPerLiveWeightAfter,
        feedCostSavings: feedCostSavings,
        baselineCostPerTon: baselineCostPerTon,
        reformulatedCostPerTon: reformulatedCostPerTon,
      };

    } else {
      // For 'On-top' applications or other 'Matrix' cases, use the original prompt-based calculation.
      const { output } = await prompt(input);
      return output!;
    }
  }
);
