import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type OptimizationResult } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportResultsToCsv(result: OptimizationResult) {
  const { inputs, roiData, ghgData } = result;
  
  const headers = [
    // Inputs
    "Livestock Type", "Number of Birds", "Broiler Live Weight (kg)", "Mortality Rate (%)",
    "Feed Additive", "Inclusion Rate (kg/ton)", "Baseline FCR", "FCR After", 
    "Feed Cost ($/ton)", "Additive Cost ($/kg)", "Broiler Price ($/kg)",
    // Outputs
    "ROI (%)", "ROI Explanation", "GHG Savings (kg CO2e)", "GHG Explanation"
  ];

  const row = [
    "Broiler",
    inputs.numberOfBirds,
    inputs.broilerLiveWeight,
    inputs.mortalityRate,
    inputs.feedAdditive,
    inputs.inclusionRate,
    inputs.baselineFCR,
    inputs.feedConversionRatioAfter,
    inputs.feedCost,
    inputs.additiveCost,
    inputs.livestockPrice,
    (roiData.roi * 100).toFixed(2),
    `"${roiData.explanation.replace(/"/g, '""')}"`,
    ghgData.ghgSavings.toFixed(2),
    `"${ghgData.explanation.replace(/"/g, '""')}"`
  ];

  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + row.map(field => `${field}`).join(",");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "broiler_optimizer_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
