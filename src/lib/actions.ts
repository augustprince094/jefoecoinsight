
"use server";

import { calculateROI, type ROIInput } from '@/ai/flows/calculate-roi';
import { estimateGHGSavings, type EstimateGHGSavingsInput } from '@/ai/flows/estimate-ghg-savings';
import { provideAdvisory, type ProvideAdvisoryInput } from '@/ai/flows/provide-advisory';
import { type FormValues, type OptimizationResult, type DietPhase, regionSettings, Region } from '@/lib/types';

export async function getOptimizationResults(
  data: FormValues, 
  recalculateDietPhase?: DietPhase
): Promise<{ data?: OptimizationResult; error?: string }> {
  try {
    // If recalculating, use the provided phase, otherwise default to Starter or the form's value.
    const dietPhase = recalculateDietPhase || data.dietPhase || "Starter";
    const currency = regionSettings[data.region as Region]?.currency || 'USD';

    // This is a safe guard for when the form is submitted with empty values
    const filledData = {
        numberOfBirds: data.numberOfBirds ?? 50000,
        broilerLiveWeight: data.broilerLiveWeight ?? 2.5,
        baselineMortalityRate: data.baselineMortalityRate ?? 4.5,
        baselineFCR: data.baselineFCR ?? 1.75,
        feedCost: data.feedCost ?? 0.45,
        additiveCost: data.additiveCost ?? 12.50,
        milkPrice: data.milkPrice ?? 0.75,
        daysInMilk: data.daysInMilk ?? 150,
        ...data
    }
    
    const costMetrics = {
        feedCost: filledData.feedCost!,
        additiveCost: filledData.additiveCost!,
        currency: currency,
    };

    // Jefo P(OA+EO) is always an "On-top" application.
    // We set it here to ensure the correct calculation paths are followed in the flows.
    const applicationType = filledData.feedAdditive === "Jefo P(OA+EO)" ? "On-top" : filledData.applicationType;
    
    const roiInput: ROIInput = {
      region: filledData.region,
      applicationType: applicationType,
      dietPhase: dietPhase,
      feedAdditiveType: filledData.feedAdditive,
      inclusionRate: filledData.inclusionRate / 1000,
      numberOfBirds: filledData.numberOfBirds!,
      broilerLiveWeight: filledData.broilerLiveWeight!,
      mortalityRateBefore: filledData.baselineMortalityRate!,
      mortalityRateAfter: filledData.mortalityRateAfter,
      feedConversionRatioBefore: filledData.baselineFCR!,
      feedConversionRatioAfter: filledData.feedConversionRatioAfter,
      costMetrics,
      milkPrice: filledData.milkPrice,
      daysInMilk: filledData.daysInMilk,
    };
    
    const ghgInput: EstimateGHGSavingsInput = {
      region: filledData.region,
      applicationType: applicationType,
      dietPhase: dietPhase,
      feedAdditive: filledData.feedAdditive,
      inclusionRate: filledData.inclusionRate / 1000,
      numberOfBirds: filledData.numberOfBirds!,
      broilerLiveWeight: filledData.broilerLiveWeight!,
      mortalityRateBefore: filledData.baselineMortalityRate!,
      mortalityRateAfter: filledData.mortalityRateAfter,
      feedConversionRatioBefore: filledData.baselineFCR!,
      feedConversionRatioAfter: filledData.feedConversionRatioAfter,
      milkPrice: filledData.milkPrice,
      daysInMilk: filledData.daysInMilk,
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
        feedAdditive: filledData.feedAdditive,
        applicationType: applicationType,
        numberOfBirds: filledData.numberOfBirds!,
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
    const updatedInputs = { ...filledData, applicationType: applicationType, dietPhase: dietPhase };

    return { data: { roiData, ghgData, advisoryData, inputs: updatedInputs as FormValues } };
  } catch (e) {
    console.error("Error in getOptimizationResults:", e);
    const error = e as Error;
    return { error: error.message || "An unexpected error occurred while processing your request." };
  }
}
