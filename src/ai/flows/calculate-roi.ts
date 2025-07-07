
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
  prompt: `You are an expert in broiler economics. Your main task is to calculate the return on investment (ROI) and related financial metrics for using a feed additive.

Follow the user's formulas precisely.

**Input Data:**
- Number of birds per cycle: {{{numberOfBirds}}}
- Target live weight per broiler: {{{broilerLiveWeight}}} kg
- Baseline Mortality rate: {{{mortalityRateBefore}}} %
- Baseline Feed Conversion Ratio (FCR): {{{feedConversionRatioBefore}}}
- New Mortality rate (after additive): {{{mortalityRateAfter}}} %
- New FCR (after additive): {{{feedConversionRatioAfter}}}
- Cost per kg of Feed: \${{{costMetrics.feedCost}}}
- Additive Cost: \${{{costMetrics.additiveCost}}} per kg
- Additive Inclusion Rate: {{{inclusionRate}}} kg/ton

**Calculation Steps:**

1.  **Calculate Total Baseline Cost:**
    a. First, calculate **Average Feed per Bird (Baseline)** = \`{{{feedConversionRatioBefore}}} * {{{broilerLiveWeight}}}\`.
    b. Next, calculate the **Survival Rate (Baseline)** = \`1 - ({{{mortalityRateBefore}}} / 100)\`.
    c. Now, calculate the **Total Baseline Cost** using this exact formula: \`( ({{{numberOfBirds}}} * Average Feed per Bird (Baseline) * {{{costMetrics.feedCost}}}) / Survival Rate (Baseline) )\`.
    d. Calculate **Total Live Weight Before** = \`{{{numberOfBirds}}} * Survival Rate (Baseline) * {{{broilerLiveWeight}}}\`.
    e. Calculate \`feedCostPerLiveWeightBefore\` = \`Total Baseline Cost / Total Live Weight Before\`.

2.  **Calculate New Costs (With Additive):**
    a. First, calculate the **Average Feed per Bird (After)** = \`{{{feedConversionRatioAfter}}} * {{{broilerLiveWeight}}}\`.
    b. Next, calculate the **Survival Rate (After)** = \`1 - ({{{mortalityRateAfter}}} / 100)\`.
    c. Now, calculate the **Total Feed Cost After** using this exact formula: \`( ({{{numberOfBirds}}} * Average Feed per Bird (After) * {{{costMetrics.feedCost}}}) / Survival Rate (After) )\`.
    d. Calculate the **Total Feed Consumed After**: This is the feed portion of the cost calculation: \`( ({{{numberOfBirds}}} * Average Feed per Bird (After)) / Survival Rate (After) )\`.
    e. Calculate **Total Investment in Additive** = \`(Total Feed Consumed After / 1000) * {{{inclusionRate}}} * {{{costMetrics.additiveCost}}}\`.
    f. Calculate **Total Cost With Additive** = \`Total Feed Cost After + Total Investment in Additive\`.
    g. Calculate **Total Live Weight After** = \`{{{numberOfBirds}}} * Survival Rate (After) * {{{broilerLiveWeight}}}\`.
    h. Calculate \`feedCostPerLiveWeightAfter\` = \`Total Cost With Additive / Total Live Weight After\`.

3.  **Calculate Savings and ROI:**
    a. Calculate **Total Cost Savings (\`feedCostSavings\`)** = \`Total Baseline Cost - Total Cost With Additive\`.
    b. If Total Investment in Additive is zero or less, the ROI is infinite. Otherwise, calculate **\`roi\`** = \`feedCostSavings / Total Investment in Additive\`.

Provide a detailed step-by-step explanation following the structure above, showing the result of each calculation.
Return all the required fields in the output schema.
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

      const totalLiveWeightAfter = input.numberOfBirds * (1 - (input.mortalityRateAfter / 100)) * input.broilerLiveWeight;
      const totalLiveWeightBefore = input.numberOfBirds * (1 - (input.mortalityRateBefore / 100)) * input.broilerLiveWeight;

      const feedCostPerLiveWeightAfter = totalLiveWeightAfter > 0 ? (totalFeedCostAfter + totalInvestmentInAdditive) / totalLiveWeightAfter : 0;
      const feedCostPerLiveWeightBefore = totalLiveWeightBefore > 0 ? totalFeedCostBefore / totalLiveweightBefore : 0;
      
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
      // For 'On-top' applications or other 'Matrix' cases, use the new prompt-based calculation.
      const { output } = await prompt(input);
      return output!;
    }
  }
);
