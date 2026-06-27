"use client";

import { useState } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CalculatorForm } from "@/components/calculator-form";
import { CalculatorResults } from "@/components/calculator-results";

import { ComparativeResults, EmissionResults, FarmData } from "../../../types";

export default function CalculatorPage() {
  const [scenarioFcr, setScenarioFcr] = useState<string>("");
  const [scenarioFecalN, setScenarioFecalN] = useState<string>("");
  const [scenarioFecalP, setScenarioFecalP] = useState<string>("");
  const [step, setStep] = useState<"input" | "results">("input");
  const [baselineData, setBaselineData] = useState<FarmData | null>(null);
  const [baselineResults, setBaselineResults] =
    useState<EmissionResults | null>(null);
  const [comparisonResults, setComparisonResults] =
    useState<ComparativeResults | null>(null);
  const [selectedAdditive, setSelectedAdditive] =
    useState<FarmData["additive"]>("none");
  const [scenarioMoistureContent, setScenarioMoistureContent] =
    useState<string>("");

  return (
    <div>
      <Header />

      <main className="flex-grow container mx-auto px-12 py-8">
        {step === "input" ? (
          <CalculatorForm
            setBaselineData={setBaselineData}
            setBaselineResults={setBaselineResults}
            setComparisonResults={setComparisonResults}
            setScenarioFcr={setScenarioFcr}
            setScenarioFecalN={setScenarioFecalN}
            setScenarioFecalP={setScenarioFecalP}
            setScenarioMoistureContent={setScenarioMoistureContent}
            setSelectedAdditive={setSelectedAdditive}
            setStep={setStep}
          />
        ) : (
          <CalculatorResults
            baselineData={baselineData}
            baselineResults={baselineResults}
            comparisonResults={comparisonResults}
            selectedAdditive={selectedAdditive}
            scenarioFcr={scenarioFcr}
            scenarioFecalN={scenarioFecalN}
            scenarioFecalP={scenarioFecalP}
            scenarioMoistureContent={scenarioMoistureContent}
            setBaselineData={setBaselineData}
            setBaselineResults={setBaselineResults}
            setScenarioFcr={setScenarioFcr}
            setScenarioFecalN={setScenarioFecalN}
            setScenarioFecalP={setScenarioFecalP}
            setScenarioMoistureContent={setScenarioMoistureContent}
            setStep={setStep}
            setComparisonResults={setComparisonResults}
            setSelectedAdditive={setSelectedAdditive}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
