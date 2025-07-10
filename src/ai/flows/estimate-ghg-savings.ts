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
import { feedAdditiveData, regionalBaselineGHG } from '@/lib/additive-data';
import { feedData } from '@/lib/feed-data';

const EstimateGHGSavingsInputSchema = z.object({
  region: z.string().describe('The region of operation.'),
  applicationType: z.string().optional().describe('The application type (Matrix or On-top).'),
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
  baselineGHG: z.number().optional().describe('The baseline total GHG emissions in kg CO2e.'),
  ghgWithAdditive: z.number().optional().describe('The total GHG emissions with the additive in kg CO2e.'),
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

  Based on the provided information, estimate the GHG emission reductions resulting from the use of a feed additive. The savings come from improved feed efficiency and reduced mortality.
  Use the following formula to estimate total feed consumption, which accounts for mortality: Total Feed Consumed = (Total Birds * FCR * Live Weight) / (1 - (Mortality Rate / 100)).

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
  1.  Calculate total feed consumed for the 'Before' scenario. Formula: Total Feed Consumed (Before) = (Number of Birds * FCR Before * Live Weight) / (1 - (Mortality Rate Before / 100)).
  2.  Calculate total feed consumed for the 'After' scenario. Formula: Total Feed Consumed (After) = (Number of Birds * FCR After * Live Weight) / (1 - (Mortality Rate After / 100)).
  3.  Calculate total feed saved = Total Feed Consumed (Before) - Total Feed Consumed (After).
  4.  The GHG factor for feed is 1.2 kg CO2e/kg feed.
  5.  Calculate Baseline GHG = Total Feed Consumed (Before) * 1.2.
  6.  Calculate GHG With Additive = Total Feed Consumed (After) * 1.2.
  7.  Calculate GHG Savings = Baseline GHG - GHG With Additive.

  Provide both the estimated GHG savings and a brief explanation of your calculation.
  Ensure that the units for ghgSavings are in kg CO2e.
  Return all required fields, including baselineGHG and ghgWithAdditive.
  `,
});

const estimateGHGSavingsFlow = ai.defineFlow(
  {
    name: 'estimateGHGSavingsFlow',
    inputSchema: EstimateGHGSavingsInputSchema,
    outputSchema: EstimateGHGSavingsOutputSchema,
  },
  async (input) => {
    // Matrix application
    if (input.applicationType === 'Matrix' && (input.feedAdditive === 'Jefo Pro Solution' || input.feedAdditive === 'Jefo Xylanase')) {
      const regionFeed = feedData.find(d => d.region === input.region);
      if (!regionFeed) {
        throw new Error(`Feed data for region ${input.region} not found.`);
      }

      const baselineGHGPerTon = regionFeed.ingredients.reduce((total, ing) => {
        return total + ing.quantity * ing.carbonFootprint;
      }, 0);
      
      let reformulatedIngredients;
      if (input.feedAdditive === 'Jefo Pro Solution') {
        reformulatedIngredients = regionFeed.ingredients.map(ing => {
          let newQuantity = ing.quantity;
          switch (ing.name) {
            case 'Corn': newQuantity *= 1.031; break;
            case 'Soybean Meal': newQuantity *= (1 - 0.045); break;
            case 'Soybean Oil': newQuantity *= (1 - 0.06); break;
            case 'Synthetic Amino Acid': newQuantity *= (1 - 0.031); break;
            case 'Other Raw Materials': newQuantity *= 1.007; break;
          }
          return { ...ing, quantity: newQuantity };
        });
      } else { // Jefo Xylanase
        reformulatedIngredients = regionFeed.ingredients.map(ing => {
          let newQuantity = ing.quantity;
          switch (ing.name) {
            case 'Corn': newQuantity *= 1.034; break;
            case 'Soybean Meal': newQuantity *= (1 - 0.007); break;
            case 'Soybean Oil': newQuantity *= (1 - 0.342); break;
            case 'Synthetic Amino Acid': newQuantity *= 1.005; break;
            case 'Other Raw Materials': newQuantity *= (1 - 0.003); break;
          }
          return { ...ing, quantity: newQuantity };
        });
      }
      
      const reformulatedGHGPerTon = reformulatedIngredients.reduce((total, ing) => {
        return total + ing.quantity * ing.carbonFootprint;
      }, 0);
      
      const totalFeedConsumedAfter = (input.numberOfBirds * input.feedConversionRatioAfter * input.broilerLiveWeight) / (1 - (input.mortalityRateAfter / 100));
      const totalFeedConsumedAfterInTons = totalFeedConsumedAfter / 1000;
      
      const ghgSavingsPerTon = baselineGHGPerTon - reformulatedGHGPerTon;
      const ghgSavings = ghgSavingsPerTon * totalFeedConsumedAfterInTons;
      
      // Calculate total baseline and with-additive values
      const totalFeedConsumedBefore = (input.numberOfBirds * input.feedConversionRatioBefore * input.broilerLiveWeight) / (1 - (input.mortalityRateBefore / 100));
      const totalFeedConsumedBeforeInTons = totalFeedConsumedBefore / 1000;
      
      const baselineGHG = baselineGHGPerTon * totalFeedConsumedBeforeInTons;
      const ghgWithAdditive = reformulatedGHGPerTon * totalFeedConsumedAfterInTons;

      const explanation = `For a 'Matrix' application with ${input.feedAdditive}, GHG savings are from feed reformulation based on GHG factors of ingredients:\n\n` +
        `1. Baseline Feed GHG: ${baselineGHGPerTon.toFixed(2)} kg CO2e per ton.\n` +
        `2. Reformulated Feed GHG: ${reformulatedGHGPerTon.toFixed(2)} kg CO2e per ton.\n` +
        `3. GHG Saving per Ton: ${ghgSavingsPerTon.toFixed(2)} kg CO2e.\n` +
        `4. Total Feed Consumed (After): ${totalFeedConsumedAfterInTons.toFixed(2)} tons.\n` +
        `5. Total GHG Savings: ${ghgSavings.toFixed(2)} kg CO2e.`;

      return {
        ghgSavings,
        explanation,
        baselineGHG,
        ghgWithAdditive,
      };
    } 
    // On-top application in Canada
    else if (input.region === 'Canada' && input.applicationType === 'On-top') {
      const additiveKey = input.feedAdditive as keyof typeof feedAdditiveData;
      const additiveHasData = additiveKey in feedAdditiveData && 'ghgReductionOnTop' in feedAdditiveData[additiveKey];

      if (additiveHasData) {
        const additiveInfo = feedAdditiveData[additiveKey] as any;
        const reductionFactor = additiveInfo.ghgReductionOnTop?.Canada;

        if (reductionFactor) {
            const survivingBirdsAfter = input.numberOfBirds * (1 - input.mortalityRateAfter / 100);
            const totalLiveWeightAfter = survivingBirdsAfter * input.broilerLiveWeight;
            const baselineGHGPerKg = regionalBaselineGHG.Canada;
            
            const totalBaselineGHG = totalLiveWeightAfter * baselineGHGPerKg;
            const ghgSavings = totalBaselineGHG * reductionFactor;
            const ghgWithAdditive = totalBaselineGHG - ghgSavings;

            const explanation = `For an 'On-top' application in Canada with ${input.feedAdditive}, GHG savings are based on reduced emissions per kg of live weight:\n\n` +
            `1. Total Live Weight Produced: ${totalLiveWeightAfter.toFixed(2)} kg.\n` +
            `2. Baseline GHG Emissions: ${totalBaselineGHG.toFixed(2)} kg CO2e (at ${baselineGHGPerKg} kg CO2e per kg live weight).\n` +
            `3. GHG Reduction with Additive: ${(reductionFactor * 100).toFixed(1)}%.\n` +
            `4. Total GHG Savings: ${ghgSavings.toFixed(2)} kg CO2e.`;

            return {
                ghgSavings,
                explanation,
                baselineGHG: totalBaselineGHG,
                ghgWithAdditive,
            };
        }
      }
    }

    // Fallback to original prompt-based calculation for other regions/applications
    const {output} = await prompt(input);
    return output!;
  }
);
