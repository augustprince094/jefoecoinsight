
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
import { regionSettings } from '@/lib/types';

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
    feedCost: z.number().describe('The cost per kg of feed, in the regional currency.'),
    additiveCost: z.number().describe('The cost of the feed additive in the regional currency per kg.'),
    currency: z.string().describe('The currency code (e.g., USD, EUR, PHP).'),
  }).describe('Cost metrics related to production.'),
  // Dairy specific fields
  milkPrice: z.number().optional().describe('The price of milk in $/kg.'),
  daysInMilk: z.number().optional().describe('The number of days in milk for a dairy cow.'),
});

export type ROIInput = z.infer<typeof ROIInputSchema>;

const ROIOutputSchema = z.object({
  roi: z.number().describe('The calculated return on investment (ROI) as a decimal ratio to 1.'),
  explanation: z.string().describe('An explanation of how the ROI was calculated, showing the steps.'),
  feedCostPerLiveWeightBefore: z.number().describe('The feed cost per kg of live weight before the additive, in the regional currency.'),
  feedCostPerLiveWeightAfter: z.number().describe('The feed cost per kg of live weight after using the additive, in the regional currency.'),
  feedCostSavings: z.number().describe('The total feed cost savings in the regional currency.'),
  baselineCostPerTon: z.number().optional().describe('The baseline feed cost per ton in the regional currency.'),
  reformulatedCostPerTon: z.number().optional().describe('The reformulated feed cost per ton in the regional currency.'),
});

export type ROIOutput = z.infer<typeof ROIOutputSchema>;

export async function calculateROI(input: ROIInput): Promise<ROIOutput> {
  return calculateROIFlow(input);
}

const formatCurrencyForPrompt = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(value);
}

const calculateROIFlow = ai.defineFlow(
  {
    name: 'calculateROIFlow',
    inputSchema: ROIInputSchema,
    outputSchema: ROIOutputSchema,
  },
  async (input) => {
    const currency = input.costMetrics.currency;

    if (input.applicationType === 'Matrix' && (input.feedAdditiveType === 'Jefo Pro Solution' || input.feedAdditiveType === 'Jefo Xylanase')) {
      const dietPhase = (input.dietPhase || 'Starter') as 'Starter' | 'Grower' | 'Finisher';
      const region = input.region as keyof typeof regionSettings;
      const regionFeedData = feedData.find(d => d.region === region);

      if (!regionFeedData) {
        throw new Error(`Feed data for region ${region} not found.`);
      }
      
      const dietIngredients = regionFeedData.diets[dietPhase];
      if (!dietIngredients) {
        throw new Error(`Diet data for phase ${dietPhase} in region ${region} not found.`);
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
        `1. Baseline Feed Cost: ${formatCurrencyForPrompt(baselineCostPerTon, currency)} per ton.\n` +
        `2. Gross Reformulated Cost: ${formatCurrencyForPrompt(grossReformulatedCostPerTon, currency)} per ton.\n` +
        `3. Additive Cost: ${formatCurrencyForPrompt(additiveCostPerTon, currency)} per ton.\n` +
        `4. Net Reformulated Cost (Gross + Additive): ${formatCurrencyForPrompt(netReformulatedCostPerTon, currency)} per ton.\n` +
        `5. Net Saving per Ton: ${formatCurrencyForPrompt(netSavingsPerTon, currency)}.\n` +
        `6. Total Net Savings (over production cycle): ${formatCurrencyForPrompt(totalNetFeedCostSavings, currency)}.\n` +
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
        `1. Baseline Production Cost: ${formatCurrencyForPrompt(totalCostBefore, currency)}.\n` +
        `2. Production Cost with Additive: ${formatCurrencyForPrompt(totalCostAfter, currency)} (includes ${formatCurrencyForPrompt(totalInvestmentInAdditive, currency)} for the additive).\n` +
        `3. Net Savings: ${formatCurrencyForPrompt(netFeedCostSavings, currency)}.\n` +
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
