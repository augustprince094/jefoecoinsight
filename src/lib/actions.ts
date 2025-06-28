
"use server";

import { calculateROI, type ROIInput } from '@/ai/flows/calculate-roi';
import { estimateGHGSavings, type EstimateGHGSavingsInput } from '@/ai/flows/estimate-ghg-savings';
import { provideAdvisory, type ProvideAdvisoryInput } from '@/ai/flows/provide-advisory';
import { type FormValues, type OptimizationResult } from '@/lib/types';

export async function getOptimizationResults(data: FormValues): Promise<{ data?: OptimizationResult; error?: string }> {
  try {
    const costMetrics = {
        feedCost: data.feedCost,
        additiveCost: data.additiveCost,
    };
    
    const roiInput: ROIInput = {
      region: data.region,
      applicationType: data.applicationType,
      feedAdditiveType: data.feedAdditive,
      inclusionRate: data.inclusionRate / 1000,
      numberOfBirds: data.numberOfBirds,
      broilerLiveWeight: data.broilerLiveWeight,
      mortalityRateBefore: data.baselineMortalityRate,
      mortalityRateAfter: data.mortalityRateAfter,
      feedConversionRatioBefore: data.baselineFCR,
      feedConversionRatioAfter: data.feedConversionRatioAfter,
      costMetrics,
    };
    
    const ghgInput: EstimateGHGSavingsInput = {
      feedAdditive: data.feedAdditive,
      inclusionRate: data.inclusionRate / 1000,
      numberOfBirds: data.numberOfBirds,
      broilerLiveWeight: data.broilerLiveWeight,
      mortalityRateBefore: data.baselineMortalityRate,
      mortalityRateAfter: data.mortalityRateAfter,
      feedConversionRatioBefore: data.baselineFCR,
      feedConversionRatioAfter: data.feedConversionRatioAfter,
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
        applicationType: data.applicationType,
        numberOfBirds: data.numberOfBirds,
      },
      roiData: {
        roi: roiData.roi,
        feedCostSavings: roiData.feedCostSavings,
      },
      ghgData: {
        ghgSavings: ghgData.ghgSavings,
      },
    };

    const advisoryData = await provideAdvisory(advisoryInput);
    if (!advisoryData) {
        throw new Error("Failed to get advisory from the AI model.");
    }

    return { data: { roiData, ghgData, advisoryData, inputs: data } };
  } catch (e: any) {
    console.error("Error in getOptimizationResults:", e);
    return { error: e.message || "An unexpected error occurred while processing your request." };
  }
}
