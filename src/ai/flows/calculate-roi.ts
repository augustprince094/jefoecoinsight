
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
  feedCostSavings: z.number().describe('The total feed cost savings in $.'),
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

The calculation must account for feed consumed by both surviving birds and birds that die during the cycle. Birds that die are assumed to consume 30% of the feed that a full-grown bird would have consumed.

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
- Feed Cost (before additive): \${{{costMetrics.feedCost}}} per kg of live weight
- Additive Cost: \${{{costMetrics.additiveCost}}} per kg

Your calculation should only consider the feed cost savings and the cost of the additive. Do not consider the revenue from selling broilers.

Show your work in the explanation. Follow these steps for **both** the 'Before' and 'After' scenarios:
1.  First, calculate the cost of feed per ton. This value is constant for both scenarios. Formula: Feed Cost per ton = (Feed Cost per kg live weight / FCR Before) * 1000.
2.  Calculate the number of surviving birds and dead birds for the scenario.
    - Surviving Birds = Number of birds * (1 - mortality rate / 100)
    - Dead Birds = Number of birds * (mortality rate / 100)
3.  Calculate the total live weight produced by surviving birds.
    - Total Live Weight = Surviving Birds * Broiler live weight
4.  Calculate the total feed consumed by surviving birds.
    - Feed for Survivors = Total Live Weight * FCR for the scenario.
5.  Calculate the total feed consumed by birds that died.
    - Feed per survivor = Broiler live weight * FCR for the scenario
    - Feed for Dead Birds = Dead Birds * (Feed per survivor * 0.30)
6.  Calculate the total feed consumed for the scenario.
    - Total Feed Consumed = Feed for Survivors + Feed for Dead Birds
7.  Calculate the total feed cost for the scenario.
    - Total Feed Cost = (Total Feed Consumed / 1000) * Feed Cost per ton.

After calculating the above for both scenarios:
8.  Calculate the total feed cost savings = Total Feed Cost Before - Total Feed Cost After.
9.  Calculate the total investment in the additive = (Total feed consumed After / 1000) * inclusion rate * additive cost.
10. Calculate ROI = (Total Feed Cost Savings / Total Investment in Additive).
11. Calculate the feed cost per kg of live weight for the 'After' scenario by dividing the 'Total Feed Cost After' by the 'Total Live Weight' (from the 'After' scenario's step 3).

Return the ROI as a decimal number (e.g., 1.5 for 1.5:1).
Return the 'feedCostPerLiveWeightBefore' using the value from the input 'costMetrics.feedCost'.
Return the calculated 'feedCostPerLiveWeightAfter' from step 11.
Return the total feed cost savings from step 8 in the 'feedCostSavings' field.
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
    if (input.applicationType === 'Matrix') {
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
      
      const survivingBirdsAfter = input.numberOfBirds * (1 - input.mortalityRateAfter / 100);
      const deadBirdsAfter = input.numberOfBirds * (input.mortalityRateAfter / 100);
      const totalLiveWeightAfter = survivingBirdsAfter * input.broilerLiveWeight;
      const feedForSurvivorsAfter = totalLiveWeightAfter * input.feedConversionRatioAfter;
      const feedPerSurvivorAfter = input.broilerLiveWeight * input.feedConversionRatioAfter;
      const feedForDeadBirdsAfter = deadBirdsAfter * (feedPerSurvivorAfter * 0.30);
      const totalFeedConsumedAfter = feedForSurvivorsAfter + feedForDeadBirdsAfter;
      const totalFeedConsumedAfterInTons = totalFeedConsumedAfter / 1000;
      
      const feedCostSavings = (baselineCostPerTon - reformulatedCostPerTon) * totalFeedConsumedAfterInTons;
      const totalInvestmentInAdditive = totalFeedConsumedAfterInTons * input.inclusionRate * input.costMetrics.additiveCost;
      
      const roi = totalInvestmentInAdditive > 0 ? feedCostSavings / totalInvestmentInAdditive : Infinity;
      
      const totalFeedCostAfter = totalFeedConsumedAfterInTons * reformulatedCostPerTon;
      const feedCostPerLiveWeightAfter = totalLiveWeightAfter > 0 ? totalFeedCostAfter / totalLiveWeightAfter : 0;
      
      const explanation = `For a 'Matrix' application, savings are calculated from feed reformulation:\n\n` +
        `1. Baseline Feed Cost: The cost for the standard feed in ${input.region} is $${baselineCostPerTon.toFixed(2)} per ton.\n` +
        `2. Reformulated Feed Cost: With ${input.feedAdditiveType}, the new feed cost is $${reformulatedCostPerTon.toFixed(2)} per ton.\n` +
        `3. Saving per Ton: $${(baselineCostPerTon - reformulatedCostPerTon).toFixed(2)}.\n` +
        `4. Total Feed Consumed: ${totalFeedConsumedAfterInTons.toFixed(2)} tons.\n` +
        `5. Total Feed Cost Savings: $${feedCostSavings.toFixed(2)}.\n` +
        `6. Total Additive Investment: $${totalInvestmentInAdditive.toFixed(2)}.\n` +
        `7. Return on Investment (ROI): The final ROI is ${roi.toFixed(1)}:1.`;
      
      return {
        roi: roi,
        explanation: explanation,
        feedCostPerLiveWeightBefore: input.costMetrics.feedCost,
        feedCostPerLiveWeightAfter: feedCostPerLiveWeightAfter,
        feedCostSavings: feedCostSavings,
      };

    } else {
      // For 'On-top' applications, use the original prompt-based calculation.
      const { output } = await prompt(input);
      return output!;
    }
  }
);
