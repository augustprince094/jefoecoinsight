
// estimate-ghg-savings.ts
'use server';

/**
 * @fileOverview GHG emission reductions estimator AI agent for broiler production.
 *
 * - estimateGHGSavings - A function that estimates the greenhouse gas (GHG) emission reductions.
 * - EstimateGHGSavingsInput - The input type for the estimateGHGSavings function.
 * - EstimateGHGSavingsOutput - The return type for the estimateGHGSavings function.
 */

import {z} from 'genkit';
import { feedAdditiveData, regionalBaselineGHG } from '@/lib/additive-data';
import { feedData } from '@/lib/feed-data';
import { regionSettings } from '@/lib/types';

const EstimateGHGSavingsInputSchema = z.object({
  region: z.string().describe('The region of operation.'),
  applicationType: z.string().optional().describe('The application type (Matrix or On-top).'),
  dietPhase: z.string().optional().describe('The diet phase (Starter, Grower, or Finisher).'),
  feedAdditive: z.string().describe('The type of feed additive used.'),
  inclusionRate: z.number().describe('The inclusion rate of the feed additive (e.g., in kg/ton).'),
  numberOfBirds: z.number().describe('Number of birds per production cycle.'),
  broilerLiveWeight: z.number().describe('The final live weight of a broiler in kg.'),
  mortalityRateBefore: z.number().describe('The mortality rate before using the additive, as a percentage.'),
  mortalityRateAfter: z.number().describe('The mortality rate after using the additive, as a percentage.'),
  feedConversionRatioBefore: z.number().describe('The feed conversion ratio before using the additive.'),
  feedConversionRatioAfter: z.number().describe('The feed conversion ratio after using the additive.'),
  // Dairy specific fields
  milkPrice: z.number().optional().describe('The price of milk in $/kg.'),
  daysInMilk: z.number().optional().describe('The number of days in milk for a dairy cow.'),
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
    // Matrix application
    if (input.applicationType === 'Matrix' && (input.feedAdditive === 'Jefo Pro Solution' || input.feedAdditive === 'Jefo Xylanase')) {
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

      const baselineGHGPerTon = dietIngredients.reduce((total, ing) => {
        return total + ing.quantity * ing.carbonFootprint;
      }, 0);
      
      let reformulatedIngredients;
      if (input.feedAdditive === 'Jefo Pro Solution') {
         if (region === 'Asia (PH)') {
             reformulatedIngredients = dietIngredients.map(ing => {
              let newQuantity = ing.quantity;
              switch (dietPhase) {
                case 'Starter':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.061; break; // +6.1%
                    case 'Wheat': break; // +0%
                    case 'Soybean Meal': newQuantity *= (1 - 0.0494); break; // -4.94%
                    case 'Coconut Oil': newQuantity *= (1 - 0.2707); break; // -27.07%
                    case 'Fish meal': break; // 0%
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0094); break; // -0.94%
                    case 'Other Raw Materials': newQuantity *= 1.0064; break; // +0.64%
                  }
                  break;
                case 'Grower':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.0466; break; // +4.66%
                    case 'Wheat': break; // +0%
                    case 'Soybean Meal': newQuantity *= (1 - 0.0505); break; // -5.05%
                    case 'Coconut Oil': newQuantity *= (1 - 0.3459); break; // -34.59%
                    case 'Fish meal': break; // 0%
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0081); break; // -0.81%
                    case 'Other Raw Materials': newQuantity *= 1.0078; break; // +0.78%
                  }
                  break;
                case 'Finisher':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.0405; break; // +4.05%
                    case 'Wheat': break; // +0%
                    case 'Soybean Meal': newQuantity *= (1 - 0.0537); break; // -5.37%
                    case 'Coconut Oil': newQuantity *= (1 - 0.2423); break; // -24.23%
                    case 'Fish meal': break; // 0%
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0087); break; // -0.87%
                    case 'Other Raw Materials': newQuantity *= 1.0079; break; // +0.79%
                  }
                  break;
              }
              return { ...ing, quantity: newQuantity };
            });
          } else if (region === 'Latin America (BR)') {
            reformulatedIngredients = dietIngredients.map(ing => {
              let newQuantity = ing.quantity;
              switch (dietPhase) {
                case 'Starter':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.034; break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.045); break;
                    case 'Soybean Oil': newQuantity *= (1 - 0.145); break;
                    case 'Meat and bone meal': newQuantity *= 1.01; break;
                    case 'Calcium carbonate': newQuantity *= 1.004; break;
                    case 'Methionine': newQuantity *= (1 - 0.05); break;
                    case 'Lysine': newQuantity *= (1 - 0.021); break;
                    case 'Threonine': newQuantity *= (1 - 0.08); break;
                    case 'Microingredients': newQuantity *= (1 - 0.015); break;
                  }
                  break;
                case 'Grower':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.038; break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.062); break;
                    case 'Soybean Oil': newQuantity *= (1 - 0.101); break;
                    case 'Meat and bone meal': newQuantity *= 1.023; break;
                    case 'Calcium carbonate': newQuantity *= 1.001; break;
                    case 'Methionine': newQuantity *= (1 - 0.042); break;
                    case 'Lysine': newQuantity *= 1.092; break;
                    case 'Threonine': newQuantity *= (1 - 0.024); break;
                    case 'Microingredients': newQuantity *= (1 - 0.011); break;
                  }
                  break;
                case 'Finisher':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.030; break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.065); break;
                    case 'Soybean Oil': newQuantity *= (1 - 0.094); break;
                    case 'Meat and bone meal': newQuantity *= 1.025; break;
                    case 'Calcium carbonate': newQuantity *= 1.001; break;
                    case 'Methionine': newQuantity *= (1 - 0.044); break;
                    case 'Lysine': newQuantity *= 1.055; break;
                    case 'Threonine': newQuantity *= 1.00; break;
                    case 'Microingredients': newQuantity *= (1 - 0.021); break;
                  }
                  break;
              }
              return { ...ing, quantity: newQuantity };
            });
          } else { // Generic reformulation for other regions
            reformulatedIngredients = dietIngredients.map(ing => {
              let newQuantity = ing.quantity;
              switch (dietPhase) {
                case 'Starter':
                  switch (ing.name) {
                    case 'Corn':
                    case 'Wheat':
                       newQuantity *= 1.061; break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.0418); break;
                    case 'Soybean Oil':
                    case 'Coconut Oil':
                       newQuantity *= (1 - 0.0654); break;
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0334); break;
                    case 'Other Raw Materials':
                    case 'Fish meal':
                       newQuantity *= 1.0056; break;
                  }
                  break;
                case 'Grower':
                  switch (ing.name) {
                    case 'Corn':
                    case 'Wheat':
                       newQuantity *= 1.0327; break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.0438); break;
                    case 'Soybean Oil':
                    case 'Coconut Oil':
                       newQuantity *= (1 - 0.0596); break;
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0209); break;
                    case 'Other Raw Materials':
                    case 'Fish meal':
                       newQuantity *= 1.0068; break;
                  }
                  break;
                case 'Finisher':
                    switch (ing.name) {
                      case 'Corn':
                      case 'Wheat':
                         newQuantity *= 1.0279; break;
                      case 'Soybean Meal': newQuantity *= (1 - 0.0481); break;
                      case 'Soybean Oil':
                      case 'Coconut Oil':
                         newQuantity *= (1 - 0.0589); break;
                      case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0398); break;
                      case 'Other Raw Materials':
                      case 'Fish meal':
                         newQuantity *= 1.0075; break;
                  }
                  break;
              }
              return { ...ing, quantity: newQuantity };
            });
          }
      } else { // Jefo Xylanase
        if (region === 'Asia (PH)') {
             reformulatedIngredients = dietIngredients.map(ing => {
              let newQuantity = ing.quantity;
              switch (dietPhase) {
                case 'Starter':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.0488; break;
                    case 'Wheat': break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.0094); break;
                    case 'Coconut Oil': newQuantity *= (1 - 0.5816); break;
                    case 'Fish meal': break;
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0030); break;
                    case 'Other Raw Materials': newQuantity *= 1.0054; break;
                  }
                  break;
                case 'Grower':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.0218; break;
                    case 'Wheat': break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.0058); break;
                    case 'Coconut Oil': newQuantity *= (1 - 0.4695); break;
                    case 'Fish meal': break;
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0032); break;
                    case 'Other Raw Materials': newQuantity *= 1.0605; break;
                  }
                  break;
                case 'Finisher':
                  switch (ing.name) {
                    case 'Corn': newQuantity *= 1.0321; break;
                    case 'Wheat': break;
                    case 'Soybean Meal': newQuantity *= (1 - 0.0106); break;
                    case 'Coconut Oil': newQuantity *= (1 - 0.4871); break;
                    case 'Fish meal': break;
                    case 'Synthetic Amino Acid': newQuantity *= (1 - 0.0054); break;
                    case 'Other Raw Materials': newQuantity *= 1.0274; break;
                  }
                  break;
              }
              return { ...ing, quantity: newQuantity };
            });
        } else if (region === 'Latin America (BR)') {
          reformulatedIngredients = dietIngredients.map(ing => {
            let newQuantity = ing.quantity;
            switch (dietPhase) {
              case 'Starter':
                switch (ing.name) {
                  case 'Corn': newQuantity *= 1.022; break;
                  case 'Soybean Meal': newQuantity *= (1 - 0.003); break;
                  case 'Soybean Oil': newQuantity *= (1 - 0.602); break;
                  case 'Meat and bone meal': newQuantity *= (1 - 0.002); break;
                  case 'Calcium carbonate': newQuantity *= 1.197; break;
                  case 'Methionine': newQuantity *= (1 - 0.005); break;
                  case 'Lysine': newQuantity *= 1.004; break;
                  case 'Threonine': newQuantity *= (1 - 0.011); break;
                  case 'Microingredients': newQuantity *= (1 - 0.006); break;
                }
                break;
              case 'Grower':
                switch (ing.name) {
                  case 'Corn': newQuantity *= 1.033; break;
                  case 'Soybean Meal': newQuantity *= (1 - 0.009); break;
                  case 'Soybean Oil': newQuantity *= (1 - 0.463); break;
                  case 'Meat and bone meal': newQuantity *= 1.004; break;
                  case 'Calcium carbonate': newQuantity *= 1.006; break;
                  case 'Methionine': newQuantity *= (1 - 0.007); break;
                  case 'Lysine': newQuantity *= 1.05; break;
                  case 'Threonine': newQuantity *= (1 - 0.024); break;
                  case 'Microingredients': newQuantity *= 1.025; break;
                }
                break;
              case 'Finisher':
                switch (ing.name) {
                  case 'Corn': newQuantity *= 1.031; break;
                  case 'Soybean Meal': newQuantity *= (1 - 0.012); break;
                  case 'Soybean Oil': newQuantity *= (1 - 0.527); break;
                  case 'Meat and bone meal': newQuantity *= (1 - 0.005); break;
                  case 'Calcium carbonate': newQuantity *= (1 - 0.007); break;
                  case 'Methionine': newQuantity *= 1.008; break;
                  case 'Lysine': newQuantity *= 1.036; break;
                  case 'Threonine': newQuantity *= 1.00; break;
                  case 'Microingredients': newQuantity *= 1.015; break;
                }
                break;
            }
            return { ...ing, quantity: newQuantity };
          });
        } else { // Generic reformulation
          reformulatedIngredients = dietIngredients.map(ing => {
            let newQuantity = ing.quantity;
            switch (dietPhase) {
                case 'Starter':
                    switch (ing.name) {
                        case 'Corn':
                        case 'Wheat':
                           newQuantity *= 1.0343; break;
                        case 'Soybean Meal': newQuantity *= (1 - 0.0073); break;
                        case 'Soybean Oil':
                        case 'Coconut Oil':
                           newQuantity *= (1 - 0.3421); break;
                        case 'Synthetic Amino Acid': newQuantity *= 1.0051; break;
                        case 'Other Raw Materials':
                        case 'Fish meal':
                           newQuantity *= (1 - 0.0027); break;
                    }
                    break;
                case 'Grower':
                  switch (ing.name) {
                      case 'Corn':
                      case 'Wheat':
                           newQuantity *= 1.0328; break;
                      case 'Soybean Meal': newQuantity *= (1 - 0.0083); break;
                      case 'Soybean Oil':
                      case 'Coconut Oil':
                           newQuantity *= (1 - 0.3343); break;
                      case 'Synthetic Amino Acid': newQuantity *= 1.0040; break;
                      case 'Other Raw Materials':
                      case 'Fish meal':
                           newQuantity *= (1 - 0.0032); break;
                  }
                  break;
                case 'Finisher':
                    switch (ing.name) {
                        case 'Corn':
                        case 'Wheat':
                           newQuantity *= 1.0314; break;
                        case 'Soybean Meal': newQuantity *= (1 - 0.0103); break;
                        case 'Soybean Oil':
                        case 'Coconut Oil':
                           newQuantity *= (1 - 0.3792); break;
                        case 'Synthetic Amino Acid': newQuantity *= 1.0043; break;
                        case 'Other Raw Materials':
                        case 'Fish meal':
                           newQuantity *= (1 - 0.0036); break;
                    }
                    break;
            }
            return { ...ing, quantity: newQuantity };
          });
        }
      }
      
      const reformulatedGHGPerTon = reformulatedIngredients.reduce((total, ing) => {
        return total + ing.quantity * ing.carbonFootprint;
      }, 0);
      
      const totalFeedConsumedAfter = (input.numberOfBirds * input.feedConversionRatioAfter * input.broilerLiveWeight) / (1 - (input.mortalityRateAfter / 100));
      const totalFeedConsumedAfterInTons = totalFeedConsumedAfter / 1000;
      
      const totalFeedConsumedBefore = (input.numberOfBirds * input.feedConversionRatioBefore * input.broilerLiveWeight) / (1 - (input.mortalityRateBefore / 100));
      const totalFeedConsumedBeforeInTons = totalFeedConsumedBefore / 1000;
      
      const baselineGHG = baselineGHGPerTon * totalFeedConsumedBeforeInTons;
      const ghgWithAdditive = reformulatedGHGPerTon * totalFeedConsumedAfterInTons;
      const ghgSavings = baselineGHG - ghgWithAdditive;


      const explanation = `For a 'Matrix' application with ${input.feedAdditive}, GHG savings are from feed reformulation and performance improvements:\n\n` +
        `1. Baseline Feed GHG Factor: ${baselineGHGPerTon.toFixed(2)} kg CO2e per ton.\n` +
        `2. Total Baseline Emissions: ${baselineGHG.toFixed(2)} kg CO2e.\n` +
        `3. Reformulated Feed GHG Factor: ${reformulatedGHGPerTon.toFixed(2)} kg CO2e per ton.\n` +
        `4. Total Emissions with Additive: ${ghgWithAdditive.toFixed(2)} kg CO2e.\n` +
        `5. Total GHG Savings: ${ghgSavings.toFixed(2)} kg CO2e.`;

      return {
        ghgSavings,
        explanation,
        baselineGHG,
        ghgWithAdditive,
      };
    } 
    // On-top application
    else if (input.applicationType === 'On-top') {
      const region = input.region as keyof typeof regionalBaselineGHG;
      if (!regionalBaselineGHG[region]) {
        throw new Error(`On-top GHG reduction data not available for region: ${input.region}`);
      }
      
      const additiveKey = input.feedAdditive as keyof typeof feedAdditiveData;
      const additiveInfo = feedAdditiveData[additiveKey];
      // @ts-expect-error This is a valid check, but TypeScript cannot infer the nested structure perfectly.
      const reductionFactor = additiveInfo.ghgReductionOnTop?.[region];

      if (reductionFactor) {
          const survivingBirdsBefore = input.numberOfBirds * (1 - input.mortalityRateBefore / 100);
          const totalLiveWeightBefore = survivingBirdsBefore * input.broilerLiveWeight;
          const baselineGHGPerKg = regionalBaselineGHG[region as keyof typeof regionalBaselineGHG] || regionalBaselineGHG["North America (CA)"];
          
          const totalBaselineGHG = totalLiveWeightBefore * baselineGHGPerKg;
          
          // Calculate GHG with additive based on *after* parameters for an accurate comparison
          const survivingBirdsAfter = input.numberOfBirds * (1 - (input.mortalityRateAfter / 100));
          const totalLiveWeightAfter = survivingBirdsAfter * input.broilerLiveWeight;
          
          // Apply the reduction factor to the baseline emission rate
          const ghgWithAdditivePerKg = baselineGHGPerKg * (1 - reductionFactor);
          const ghgWithAdditive = totalLiveWeightAfter * ghgWithAdditivePerKg;

          const ghgSavings = totalBaselineGHG - ghgWithAdditive;

          const explanation = `For an 'On-top' application in ${region} with ${input.feedAdditive}, GHG savings are based on reduced emissions per kg of live weight:\n\n` +
          `1. Total Baseline Live Weight Produced: ${totalLiveWeightBefore.toFixed(2)} kg.\n` +
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

    // Fallback calculation for scenarios not covered by hardcoded logic.
    // This part is likely not hit due to the comprehensive logic above, but it's a good safeguard.
    const totalFeedConsumedBefore = (input.numberOfBirds * input.feedConversionRatioBefore * input.broilerLiveWeight) / (1 - (input.mortalityRateBefore / 100));
    const totalFeedConsumedAfter = (input.numberOfBirds * input.feedConversionRatioAfter * input.broilerLiveWeight) / (1 - (input.mortalityRateAfter / 100));
    const ghgFactor = 1.2; // kg CO2e/kg feed
    const baselineGHG = totalFeedConsumedBefore * ghgFactor;
    const ghgWithAdditive = totalFeedConsumedAfter * ghgFactor;
    const ghgSavings = baselineGHG - ghgWithAdditive;
    const explanation = `GHG savings are calculated based on the reduction in total feed consumed due to improved Feed Conversion Ratio (FCR) and reduced mortality.\n\n` +
      `1. Feed Consumed (Before): ${totalFeedConsumedBefore.toFixed(2)} kg.\n` +
      `2. Feed Consumed (After): ${totalFeedConsumedAfter.toFixed(2)} kg.\n` +
      `3. GHG Emission Factor for Feed: ${ghgFactor} kg CO₂e per kg of feed.\n` +
      `4. Total GHG Savings: ${ghgSavings.toFixed(2)} kg CO₂e.`;

    return {
      ghgSavings,
      explanation,
      baselineGHG,
      ghgWithAdditive,
    };
}
