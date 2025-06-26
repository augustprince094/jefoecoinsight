"use server";

import { calculateROI, type ROIInput } from '@/ai/flows/calculate-roi';
import { estimateGHGSavings, type EstimateGHGSavingsInput } from '@/ai/flows/estimate-ghg-savings';
import { type FormValues, type OptimizationResult } from '@/lib/types';

function formatObjectAsString(obj: Record<string, any>): string {
    return Object.entries(obj)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
        .join(', ');
}

export async function getOptimizationResults(data: FormValues): Promise<{ data?: OptimizationResult; error?: string }> {
  try {
    const costMetrics = {
        feedCost: data.feedCost,
        additiveCost: data.additiveCost,
        livestockPrice: data.livestockPrice,
    };
    
    let productionMetrics: ROIInput['productionMetrics'] = {
        feedConversionRatio: data.feedConversionRatioAfter, // Use 'after' FCR for ROI calc
    };
    
    switch (data.livestockType) {
        case 'broilers':
        case 'pigs':
            productionMetrics.averageDailyGain = data.averageDailyGain;
            break;
        case 'layers':
            productionMetrics.eggProductionRate = data.eggProductionRate;
            break;
        case 'dairy cows':
            productionMetrics.milkYield = data.milkYield;
            break;
    }

    const roiInput: ROIInput = {
      livestockType: data.livestockType,
      feedAdditiveType: data.feedAdditive,
      inclusionRate: data.inclusionRate,
      productionMetrics,
      costMetrics,
    };
    
    const productionMetricsForGhg = {
        feedConversionRatioBefore: data.feedConversionRatioBefore,
        feedConversionRatioAfter: data.feedConversionRatioAfter,
        averageDailyGain: data.averageDailyGain,
        eggProductionRate: data.eggProductionRate,
        milkYield: data.milkYield,
    }

    const ghgInput: EstimateGHGSavingsInput = {
      livestockType: data.livestockType,
      feedAdditive: data.feedAdditive,
      inclusionRate: data.inclusionRate,
      feedConversionRatioBefore: data.feedConversionRatioBefore,
      feedConversionRatioAfter: data.feedConversionRatioAfter,
      productionMetrics: formatObjectAsString(productionMetricsForGhg),
      costMetrics: formatObjectAsString(costMetrics),
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
