
"use server";

import { calculateROI, type ROIInput } from '@/ai/flows/calculate-roi';
import { estimateGHGSavings, type EstimateGHGSavingsInput } from '@/ai/flows/estimate-ghg-savings';
import { provideAdvisory, type ProvideAdvisoryInput } from '@/ai/flows/provide-advisory';
import { type FormValues, type OptimizationResult, type DietPhase } from '@/lib/types';

export async function getOptimizationResults(
  data: FormValues, 
  recalculateDietPhase?: DietPhase
): Promise<{ data?: OptimizationResult; error?: string }> {
  try {
    // If recalculating, use the provided phase, otherwise default to Starter or the form's value.
    const dietPhase = recalculateDietPhase || data.dietPhase || "Starter";

    const costMetrics = {
        feedCost: data.feedCost,
        additiveCost: data.additiveCost,
    };

    // Jefo P(OA+EO) is always an "On-top" application.
    // We set it here to ensure the correct calculation paths are followed in the flows.
    const applicationType = data.feedAdditive === "Jefo P(OA+EO)" ? "On-top" : data.applicationType;
    
    const roiInput: ROIInput = {
      region: data.region,
      applicationType: applicationType,
      dietPhase: dietPhase,
      feedAdditiveType: data.feedAdditive,
      inclusionRate: data.inclusionRate / 1000,
      numberOfBirds: data.numberOfBirds,
      broilerLiveWeight: data.broilerLiveWeight,
      mortalityRateBefore: data.baselineMortalityRate,
      mortalityRateAfter: data.mortalityRateAfter,
      feedConversionRatioBefore: data.baselineFCR,
      feedConversionRatioAfter: data.feedConversionRatioAfter,
      costMetrics,
      milkPrice: data.milkPrice,
      daysInMilk: data.daysInMilk,
    };
    
    const ghgInput: EstimateGHGSavingsInput = {
      region: data.region,
      applicationType: applicationType,
      dietPhase: dietPhase,
      feedAdditive: data.feedAdditive,
      inclusionRate: data.inclusionRate / 1000,
      numberOfBirds: data.numberOfBirds,
      broilerLiveWeight: data.broilerLiveWeight,
      mortalityRateBefore: data.baselineMortalityRate,
      mortalityRateAfter: data.mortalityRateAfter,
      feedConversionRatioBefore: data.baselineFCR,
      feedConversionRatioAfter: data.feedConversionRatioAfter,
      milkPrice: data.milkPrice,
      daysInMilk: data.daysInMilk,
    };

    const [roiData, ghgData] = await Promise.all([
      calculateROI(roiInput),
      estimateGHGSavings(ghgInput)
    ]);

    if (!roiData || !ghgData) {
      throw new Error("Failed to get a response from the AI models.");
    }

    const advisoryInput: ProvideAdvisoryInput = {
      inputs: {
        feedAdditive: data.feedAdditive,
        applicationType: applicationType,
        numberOfBirds: data.numberOfBirds,
      },
      roiData: {
        roi: roiData.roi,
        feedCostSavings: roiData.feedCostSavings,
      },
      ghgData: {
        ghgSavings: ghgData.ghgSavings / 1000, // Convert to tons
      },
    };

    const advisoryData = await provideAdvisory(advisoryInput);
    if (!advisoryData) {
        throw new Error("Failed to get advisory from the AI model.");
    }

    // Pass the modified applicationType and current dietPhase back with the results 
    const updatedInputs = { ...data, applicationType: applicationType, dietPhase: dietPhase };

    return { data: { roiData, ghgData, advisoryData, inputs: updatedInputs } };
  } catch (e) {
    console.error("Error in getOptimizationResults:", e);
    const error = e as Error;
    return { error: error.message || "An unexpected error occurred while processing your request." };
  }
}
