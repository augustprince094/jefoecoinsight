
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
  dietPhase: z.string().optional().describe('The diet phase (Starter, Grower, or Finisher).'),
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
  // Dairy specific fields
  milkPrice: z.number().optional().describe('The price of milk in $/kg.'),
  daysInMilk: z.number().optional().describe('The number of days in milk for a dairy cow.'),
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
    d. Calculate \`feedCostPerLiveWeightBefore\` = \`Total Baseline Cost / ({{{numberOfBirds}}} * Survival Rate (Baseline) * {{{broilerLiveWeight}}})\`.

2.  **Calculate New Costs (With Additive):**
    a. First, calculate the **Average Feed per Bird (After)** = \`{{{feedConversionRatioAfter}}} * {{{broilerLiveWeight}}}\`.
    b. Next, calculate the **Survival Rate (After)** = \`1 - ({{{mortalityRateAfter}}} / 100)\`.
    c. Now, calculate the **Total Feed Cost After** using this exact formula: \`( ({{{numberOfBirds}}} * Average Feed per Bird (After) * {{{costMetrics.feedCost}}}) / Survival Rate (After) )\`.
    d. Calculate the **Total Feed Consumed After**: This is the feed portion of the cost calculation: \`( ({{{numberOfBirds}}} * Average Feed per Bird (After)) / Survival Rate (After) )\`.
    e. Calculate **Total Investment in Additive** = \`(Total Feed Consumed After / 1000) * {{{inclusionRate}}} * {{{costMetrics.additiveCost}}}\`.
    f. Calculate **Total Cost With Additive** = \`Total Feed Cost After + Total Investment in Additive\`.
    g. Calculate \`feedCostPerLiveWeightAfter\` = \`Total Cost With Additive / ({{{numberOfBirds}}} * Survival Rate (After) * {{{broilerLiveWeight}}})\`.

3.  **Calculate Savings and ROI:**
    a. Calculate **Total Cost Savings (\`feedCostSavings\`)** = \`Total Baseline Cost - Total Cost With Additive\`.
    b. If Total Investment in Additive is zero or less, the ROI is infinite. Otherwise, calculate **\`roi\`** = \`feedCostSavings / Total Investment in Additive\`.

Provide a detailed step-by-step explanation following the structure above, showing the result of each calculation. The explanation should be a clear, multi-line string, perfect for display in a tooltip. For each step, clearly label the calculation and show the resulting number.
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
    if (input.applicationType === 'Matrix' && (input.feedAdditiveType === 'Jefo Pro Solution' || input.feedAdditiveType === 'Jefo Xylanase')) {
      const dietPhase = (input.dietPhase || 'Starter') as 'Starter' | 'Grower' | 'Finisher';
      const regionFeedData = feedData.find(d => d.region === input.region);

      if (!regionFeedData) {
        throw new Error(`Feed data for region ${input.region} not found.`);
      }
      
      const dietIngredients = regionFeedData.diets[dietPhase];
      if (!dietIngredients) {
        throw new Error(`Diet data for phase ${dietPhase} in region ${input.region} not found.`);
      }

      const baselineCostPerTon = dietIngredients.reduce((total, ing) => {
        return total + (ing.quantity / 1000) * ing.cost;
      }, 0);
      
      let reformulatedIngredients;
      if (input.feedAdditiveType === 'Jefo Pro Solution') {
          reformulatedIngredients = dietIngredients.map(ing => {
            let newQuantity = ing.quantity;
            switch (dietPhase) {
              case 'Starter':
                switch (ing.name) {
                  case 'Corn': newQuantity *= 1.0374; break;
                  case 'Soybean Meal': newQuantity *= (1 - 0.0418); break;
                  case 'Soybean Oil': newQuantity *= (1 - 0.0654); break;
                  case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0334); break;
                  case 'Other Raw Materials': newQuantity *= 1.0056; break;
                }
                break;
              case 'Grower':
                switch (ing.name) {
                  case 'Corn': newQuantity *= 1.0327; break;
                  case 'Soybean Meal': newQuantity *= (1 - 0.0438); break;
                  case 'Soybean Oil': newQuantity *= (1 - 0.0596); break;
                  case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0209); break;
                  case 'Other Raw Materials': newQuantity *= 1.0068; break;
                }
                break;
              case 'Finisher':
                switch (ing.name) {
                  case 'Corn': newQuantity *= 1.0279; break;
                  case 'Soybean Meal': newQuantity *= (1 - 0.0481); break;
                  case 'Soybean Oil': newQuantity *= (1 - 0.0589); break;
                  case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0398); break;
                  case 'Other Raw Materials': newQuantity *= 1.0075; break;
                }
                break;
            }
            return { ...ing, quantity: newQuantity };
          });
      } else { // Jefo Xylanase
          reformulatedIngredients = dietIngredients.map(ing => {
            let newQuantity = ing.quantity;
            switch (dietPhase) {
                case 'Starter':
                    switch (ing.name) {
                        case 'Corn': newQuantity *= 1.0343; break;
                        case 'Soybean Meal': newQuantity *= (1 - 0.0073); break;
                        case 'Soybean Oil': newQuantity *= (1 - 0.3421); break;
                        case 'Synthetic Amino Acid': newQuantity *= 1.0051; break;
                        case 'Other Raw Materials': newQuantity *= (1 - 0.0027); break;
                    }
                    break;
                case 'Grower':
                    switch (ing.name) {
                        case 'Corn': newQuantity *= 1.0328; break;
                        case 'Soybean Meal': newQuantity *= (1 - 0.0083); break;
                        case 'Soybean Oil': newQuantity *= (1 - 0.3343); break;
                        case 'Synthetic Amino Acid': newQuantity *= 1.0040; break;
                        case 'Other Raw Materials': newQuantity *= (1 - 0.0032); break;
                    }
                    break;
                case 'Finisher':
                     switch (ing.name) {
                        case 'Corn': newQuantity *= 1.0314; break;
                        case 'Soybean Meal': newQuantity *= (1 - 0.0103); break;
                        case 'Soybean Oil': newQuantity *= (1 - 0.3792); break;
                        case 'Synthetic Amino Acid': newQuantity *= 1.0043; break;
                        case 'Other Raw Materials': newQuantity *= (1 - 0.0036); break;
                    }
                    break;
            }
            return { ...ing, quantity: newQuantity };
          });
      }
      
      const additiveCostPerTon = input.inclusionRate * input.costMetrics.additiveCost;
      
      const grossReformulatedCostPerTon = reformulatedIngredients.reduce((total, ing) => {
        return total + (ing.quantity / 1000) * ing.cost;
      }, 0);
      
      const netReformulatedCostPerTon = grossReformulatedCostPerTon + additiveCostPerTon;

      const totalFeedConsumedAfter = (input.numberOfBirds * input.feedConversionRatioAfter * input.broilerLiveWeight) / (1 - (input.mortalityRateAfter / 100));
      const totalFeedConsumedAfterInTons = totalFeedConsumedAfter / 1000;
      
      const netSavingsPerTon = baselineCostPerTon - netReformulatedCostPerTon;
      const totalNetFeedCostSavings = netSavingsPerTon * totalFeedConsumedAfterInTons;
      const totalInvestmentInAdditive = totalFeedConsumedAfterInTons * additiveCostPerTon;
      
      const roi = totalInvestmentInAdditive > 0 ? totalNetFeedCostSavings / totalInvestmentInAdditive : Infinity;
      
      const totalFeedCostAfter = totalFeedConsumedAfterInTons * netReformulatedCostPerTon;
      const totalFeedCostBefore = ((input.numberOfBirds * input.feedConversionRatioBefore * input.broilerLiveWeight) / (1 - (input.mortalityRateBefore / 100))) / 1000 * baselineCostPerTon;

      const totalLiveWeightAfter = input.numberOfBirds * (1 - (input.mortalityRateAfter / 100)) * input.broilerLiveWeight;
      const totalLiveWeightBefore = input.numberOfBirds * (1 - (input.mortalityRateBefore / 100)) * input.broilerLiveWeight;

      const feedCostPerLiveWeightAfter = totalLiveWeightAfter > 0 ? totalFeedCostAfter / totalLiveWeightAfter : 0;
      const feedCostPerLiveWeightBefore = totalLiveWeightBefore > 0 ? totalFeedCostBefore / totalLiveWeightBefore : 0;
      
      const explanation = `For a 'Matrix' application with ${input.feedAdditiveType}, savings are calculated from the net change in feed cost per ton, factoring in both reformulation and additive cost:\n\n` +
        `1. Baseline Feed Cost: ${formatCurrency(baselineCostPerTon)} per ton.\n` +
        `2. Gross Reformulated Cost: ${formatCurrency(grossReformulatedCostPerTon)} per ton.\n` +
        `3. Additive Cost: ${formatCurrency(additiveCostPerTon)} per ton.\n` +
        `4. Net Reformulated Cost (Gross + Additive): ${formatCurrency(netReformulatedCostPerTon)} per ton.\n` +
        `5. Net Saving per Ton: ${formatCurrency(netSavingsPerTon)}.\n` +
        `6. Total Net Savings (over production cycle): ${formatCurrency(totalNetFeedCostSavings)}.\n` +
        `7. Return on Investment (ROI): The final ROI, based on Total Net Savings versus Total Additive Investment, is ${roi.toFixed(1)}:1.`;
      
      return {
        roi: roi,
        explanation: explanation,
        feedCostPerLiveWeightBefore: feedCostPerLiveWeightBefore,
        feedCostPerLiveWeightAfter: feedCostPerLiveWeightAfter,
        feedCostSavings: totalNetFeedCostSavings,
        baselineCostPerTon: baselineCostPerTon,
        reformulatedCostPerTon: netReformulatedCostPerTon,
      };

    } else {
      // For 'On-top' applications, calculate net savings and ROI
      const totalFeedConsumedAfter = (input.numberOfBirds * input.feedConversionRatioAfter * input.broilerLiveWeight) / (1 - (input.mortalityRateAfter / 100));
      const totalFeedConsumedBefore = (input.numberOfBirds * input.feedConversionRatioBefore * input.broilerLiveWeight) / (1 - (input.mortalityRateBefore / 100));

      const totalCostBefore = totalFeedConsumedBefore * input.costMetrics.feedCost;
      const totalFeedCostAfter = totalFeedConsumedAfter * input.costMetrics.feedCost;
      const totalInvestmentInAdditive = (totalFeedConsumedAfter / 1000) * input.inclusionRate * input.costMetrics.additiveCost;
      const totalCostAfter = totalFeedCostAfter + totalInvestmentInAdditive;
      
      const netFeedCostSavings = totalCostBefore - totalCostAfter;
      const roi = totalInvestmentInAdditive > 0 ? netFeedCostSavings / totalInvestmentInAdditive : Infinity;

      const totalLiveWeightAfter = input.numberOfBirds * (1 - (input.mortalityRateAfter / 100)) * input.broilerLiveWeight;
      const totalLiveWeightBefore = input.numberOfBirds * (1 - (input.mortalityRateBefore / 100)) * input.broilerLiveWeight;
      
      const feedCostPerLiveWeightAfter = totalLiveWeightAfter > 0 ? totalCostAfter / totalLiveWeightAfter : 0;
      const feedCostPerLiveWeightBefore = totalLiveWeightBefore > 0 ? totalCostBefore / totalLiveWeightBefore : 0;

      const explanation = `For an 'On-top' application with ${input.feedAdditiveType}, savings are based on improved performance (FCR and mortality) against the cost of the additive:\n\n` +
        `1. Baseline Production Cost: ${formatCurrency(totalCostBefore)}.\n` +
        `2. Production Cost with Additive: ${formatCurrency(totalCostAfter)} (includes ${formatCurrency(totalInvestmentInAdditive)} for the additive).\n` +
        `3. Net Savings: ${formatCurrency(netFeedCostSavings)}.\n` +
        `4. Return on Investment (ROI): ${roi.toFixed(1)}:1.`;

      return {
        roi: roi,
        explanation: explanation,
        feedCostPerLiveWeightBefore: feedCostPerLiveWeightBefore,
        feedCostPerLiveWeightAfter: feedCostPerLiveWeightAfter,
        feedCostSavings: netFeedCostSavings,
      };
    }
  }
);

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
