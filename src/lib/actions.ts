
"use server";

import { calculateROI, type ROIInput } from '@/ai/flows/calculate-roi';
import { estimateGHGSavings, type EstimateGHGSavingsInput } from '@/ai/flows/estimate-ghg-savings';
import { type FormValues, type OptimizationResult } from '@/lib/types';

export async function getOptimizationResults(data: FormValues): Promise<{ data?: OptimizationResult; error?: string }> {
  try {
    const costMetrics = {
        feedCost: data.feedCost,
        additiveCost: data.additiveCost,
    };
    
    const roiInput: ROIInput = {
      feedAdditiveType: data.feedAdditive,
      inclusionRate: data.inclusionRate,
      numberOfBirds: data.numberOfBirds,
      broilerLiveWeight: data.broilerLiveWeight,
      mortalityRate: data.mortalityRate,
      feedConversionRatioBefore: data.baselineFCR,
      feedConversionRatioAfter: data.feedConversionRatioAfter,
      costMetrics,
    };
    
    const ghgInput: EstimateGHGSavingsInput = {
      feedAdditive: data.feedAdditive,
      inclusionRate: data.inclusionRate,
      numberOfBirds: data.numberOfBirds,
      broilerLiveWeight: data.broilerLiveWeight,
      mortalityRate: data.mortalityRate,
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

    return { data: { roiData, ghgData, inputs: data } };
  } catch (e: any) {
    console.error("Error in getOptimizationResults:", e);
    return { error: e.message || "An unexpected error occurred while processing your request." };
  }
}
