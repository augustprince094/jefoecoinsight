import { FarmDataInput } from "@/components/farm-data-input";
import { calculateEmissions } from "@/lib/calculate-emission";

import { FarmData } from "../../types";

interface CalculatorFormProps {
  setBaselineData: (data: FarmData) => void;
  setBaselineResults: (results: any) => void;
  setScenarioFcr: (fcr: string) => void;
  setScenarioFecalN: (fecalN: string) => void;
  setScenarioFecalP: (fecalP: string) => void;
  setScenarioMoistureContent: (moistureContent: string) => void;
  setStep: (step: "input" | "results") => void;
  setComparisonResults: (results: any) => void;
  setSelectedAdditive: (additive: FarmData["additive"]) => void;
}

export const CalculatorForm = ({
  setBaselineData,
  setBaselineResults,
  setScenarioFcr,
  setScenarioFecalN,
  setScenarioFecalP,
  setScenarioMoistureContent,
  setStep,
  setComparisonResults,
  setSelectedAdditive,
}: CalculatorFormProps) => {
  const handleEstablishBaseline = (data: FarmData) => {
    const results = calculateEmissions(data, false);

    setBaselineData(data);
    setBaselineResults(results);
    setScenarioFcr("");
    setScenarioFecalN("");
    setScenarioFecalP("");
    setScenarioMoistureContent("");
    setStep("results");
    setComparisonResults(null);
    setSelectedAdditive("none");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-primary mb-3 uppercase tracking-tight">
          Cycle Baseline
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg font-semibold">
          Establish your production baseline by defining core efficiency,
          dietary metrics, or laboratory results.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <FarmDataInput onCalculate={handleEstablishBaseline} />
      </div>
    </div>
  );
};
