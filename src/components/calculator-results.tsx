import {
  ArrowRightIcon,
  CalculatorIcon,
  FlaskConicalIcon,
  LayersIcon,
  RefreshCwIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FarmDataInput } from "@/components/farm-data-input";
import { EmissionsResults } from "@/components/emissions-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AnimalType,
  ComparativeResults,
  EmissionResults,
  FarmData,
} from "../../types";
import { calculateEmissions } from "@/lib/calculate-emission";
import { calculateDiff, cn } from "@/lib/utils";

const animalTypeLabels: Record<AnimalType, string> = {
  broilers: "Broilers",
  "swine-sow": "Swine (Sow & Litter)",
  "swine-nursery": "Swine (Nursery)",
  "swine-grow-finish": "Swine (Grow-to-Finish)",
};

const awmsLabels: Record<string, string> = {
  lagoon: "Lagoon",
  "liquid-slurry": "Liquid/Slurry",
  "poultry-litter": "Poultry with litter",
  "solid-storage": "Solid storage",
  "pit-long-term": "Pit > 1 month",
};

interface CalculatorFormProps {
  comparisonResults: ComparativeResults | null;
  baselineData: FarmData | null;
  baselineResults: EmissionResults | null;
  scenarioFcr: string;
  scenarioFecalN: string;
  scenarioFecalP: string;
  scenarioMoistureContent: string;
  selectedAdditive: FarmData["additive"];
  setBaselineData: (data: FarmData | null) => void;
  setBaselineResults: (results: any) => void;
  setScenarioFcr: (fcr: string) => void;
  setScenarioFecalN: (fecalN: string) => void;
  setScenarioFecalP: (fecalP: string) => void;
  setScenarioMoistureContent: (moistureContent: string) => void;
  setStep: (step: "input" | "results") => void;
  setComparisonResults: (results: any) => void;
  setSelectedAdditive: (additive: FarmData["additive"]) => void;
}

export const CalculatorResults = ({
  comparisonResults,
  baselineData,
  baselineResults,
  scenarioFcr,
  scenarioFecalN,
  scenarioFecalP,
  scenarioMoistureContent,
  selectedAdditive,
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
  const reset = () => {
    setBaselineData(null);
    setBaselineResults(null);
    setComparisonResults(null);
    setSelectedAdditive("none");
    setStep("input");
  };

  // Handle Apply Mitigation
  const handleApplyMitigation = (additive: FarmData["additive"]) => {
    if (!baselineData || !baselineResults) return;

    setSelectedAdditive(additive);

    let targetFcrValue = Number(scenarioFcr) || baselineData.fcr;
    if (additive !== "none" && !scenarioFcr) {
      const reduction =
        additive === "jefo-combo" || additive === "xylanase"
          ? 0.94
          : additive === "jefo-pro"
            ? 0.97
            : 0.95;
      targetFcrValue = parseFloat((baselineData.fcr * reduction).toFixed(2));
    }

    let targetFecalNValue = Number(scenarioFecalN) || baselineData.fecalN || 0;
    let targetFecalPValue = Number(scenarioFecalP) || baselineData.fecalP || 0;
    let targetMoistureValue =
      Number(scenarioMoistureContent) || baselineData.moistureContent;

    if (additive !== "none") {
      if (baselineData.useExperimentalN && !scenarioFecalN) {
        targetFecalNValue = parseFloat(
          ((baselineData.fecalN || 0) * 0.97).toFixed(2),
        );
      }
      if (baselineData.useExperimentalP && !scenarioFecalP) {
        targetFecalPValue = parseFloat(
          ((baselineData.fecalP || 0) * 0.98).toFixed(2),
        );
      }
    }

    const updatedData = {
      ...baselineData,
      additive,
      fcr: targetFcrValue,
      fecalN: targetFecalNValue,
      fecalP: targetFecalPValue,
      moistureContent: targetMoistureValue,
    };
    const scenarioResults = calculateEmissions(updatedData, true);

    setComparisonResults({
      baseline: baselineResults,
      scenario: scenarioResults,
      additiveType: additive,
    });
  };

  //   Handle Scenario Metric Change
  const handleScenarioMetricChange = (
    field: "fcr" | "fecalN" | "fecalP" | "moisture",
    value: string,
  ) => {
    if (!baselineData || !baselineResults) return;

    if (field === "fcr") setScenarioFcr(value);
    else if (field === "fecalN") setScenarioFecalN(value);
    else if (field === "fecalP") setScenarioFecalP(value);
    else if (field === "moisture") setScenarioMoistureContent(value);

    const updatedFcr =
      field === "fcr"
        ? Number(value) || baselineData.fcr
        : Number(scenarioFcr) || baselineData.fcr;
    const updatedFecalN =
      field === "fecalN"
        ? Number(value) || baselineData.fecalN || 0
        : Number(scenarioFecalN) || baselineData.fecalN || 0;
    const updatedFecalP =
      field === "fecalP"
        ? Number(value) || baselineData.fecalP || 0
        : Number(scenarioFecalP) || baselineData.fecalP || 0;
    const updatedMoisture =
      field === "moisture"
        ? Number(value) || baselineData.moistureContent
        : Number(scenarioMoistureContent) || baselineData.moistureContent;

    const updatedData = {
      ...baselineData,
      additive: selectedAdditive,
      fcr: updatedFcr,
      fecalN: updatedFecalN,
      fecalP: updatedFecalP,
      moistureContent: updatedMoisture,
    };
    const scenarioResults = calculateEmissions(updatedData, true);

    setComparisonResults({
      baseline: baselineResults,
      scenario: scenarioResults,
      additiveType: selectedAdditive,
    });
  };

  // Format Diff
  const formatDiff = (diff: number) => {
    if (Math.abs(diff) < 0.1)
      return (
        <span className="text-muted-foreground text-sm font-bold">0%</span>
      );

    const isReduction = diff < 0;

    return (
      <span
        className={cn(
          "flex items-center gap-1 font-bold text-sm",
          isReduction ? "text-green-600" : "text-red-600",
        )}
      >
        {isReduction ? (
          <TrendingDownIcon className="w-4 h-4" />
        ) : (
          <TrendingUpIcon className="w-4 h-4" />
        )}
        {Math.abs(diff).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-4 space-y-8">
        <div className="glass p-6 rounded-2xl border-white/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-primary flex items-center gap-2 text-xs uppercase tracking-widest">
              <LayersIcon className="w-5 h-5" /> Parameters
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="text-xs h-9 bg-white/20 border-white/30 px-4 font-bold uppercase tracking-wider"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
          <div className="space-y-4 text-sm font-bold">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-widest font-bold">
                Category
              </span>
              <span className="text-primary">
                {baselineData ? animalTypeLabels[baselineData.animalType] : ""}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-widest font-bold">
                Analysis Mode
              </span>
              <span className="text-accent">
                {baselineData?.useExperimentalData ? "Laboratory" : "Metabolic"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-widest font-bold">
                Baseline FCR
              </span>
              <span className="text-primary">{baselineData?.fcr}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-widest font-bold">
                AWMS
              </span>
              <span className="text-primary">
                {baselineData?.awms
                  ? awmsLabels[baselineData.awms]
                  : baselineData?.manureManagement
                    ? awmsLabels[baselineData.manureManagement]
                    : "Default"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-widest font-bold">
                Exit Weight
              </span>
              <span className="text-primary font-bold">
                {baselineData?.avgWeight} kg
              </span>
            </div>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-2xl bg-primary/10 border-white/20">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
            <ArrowRightIcon className="w-5 h-5" /> Mitigation Strategies
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { id: "jefo-pro", label: "Jefo Pro", color: "#FBBC01" },
              { id: "poa-eo", label: "P(OA+EO)", color: "#D38F89" },
              { id: "xylanase", label: "Xylanase", color: "#F26648" },
              { id: "jefo-combo", label: "Xyl + Pro", color: "#FCD84B" },
            ].map((item) => (
              <Button
                key={item.id}
                variant={selectedAdditive === item.id ? "default" : "outline"}
                onClick={() => handleApplyMitigation(item.id as any)}
                className={cn(
                  "h-12 px-4 border-white/20 backdrop-blur-sm text-[11px] font-bold uppercase tracking-widest",
                  selectedAdditive === item.id
                    ? "ring-2 ring-primary ring-offset-2 text-slate-900"
                    : "hover:bg-white/40",
                )}
                style={
                  selectedAdditive === item.id
                    ? { backgroundColor: item.color }
                    : {}
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          {selectedAdditive !== "none" && (
            <div className="space-y-4 p-4 bg-white/50 rounded-xl border border-white/50 animate-in zoom-in-95 duration-200 backdrop-blur-xl">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                  <CalculatorIcon className="w-4 h-4" /> Improved FCR
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={scenarioFcr}
                  placeholder={
                    "eg. " + ((baselineData?.fcr || 1.6) * 0.95).toFixed(2)
                  }
                  onChange={(e) =>
                    handleScenarioMetricChange("fcr", e.target.value)
                  }
                  className="h-10 border-white/60 focus:ring-primary font-bold text-secondary bg-white/80 text-sm placeholder:text-muted-foreground/50"
                />
              </div>

              {baselineData?.useExperimentalData && (
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                    <ZapIcon className="w-4 h-4" /> Scenario Moisture Content
                    (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={scenarioMoistureContent}
                    placeholder={
                      "eg. " + (baselineData?.moistureContent || 12).toFixed(1)
                    }
                    onChange={(e) =>
                      handleScenarioMetricChange("moisture", e.target.value)
                    }
                    className="h-10 border-white/60 focus:ring-primary font-bold text-secondary bg-white/80 text-sm placeholder:text-muted-foreground/50"
                  />
                </div>
              )}

              {baselineData?.useExperimentalN && (
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                    <FlaskConicalIcon className="w-4 h-4" /> Scenario % Fecal N
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={scenarioFecalN}
                    placeholder={
                      "eg. " + ((baselineData?.fecalN || 4.5) * 0.97).toFixed(2)
                    }
                    onChange={(e) =>
                      handleScenarioMetricChange("fecalN", e.target.value)
                    }
                    className="h-10 border-white/60 focus:ring-primary font-bold text-secondary bg-white/80 text-sm placeholder:text-muted-foreground/50"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* {baselineData && baselineResults && (
                <MitigationAI
                  data={baselineData}
                  results={comparisonResults?.scenario || baselineResults}
                />
              )} */}
      </div>

      <div className="lg:col-span-8">
        {baselineResults && (
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-2 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm">
              <TabsTrigger
                value="results"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-[11px] font-bold uppercase tracking-widest"
              >
                Comparison
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-[11px] font-bold uppercase tracking-widest"
              >
                Technical Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="mt-0">
              <EmissionsResults
                results={
                  comparisonResults || {
                    baseline: baselineResults,
                    scenario: baselineResults,
                    additiveType: "none",
                  }
                }
                isComparison={!!comparisonResults}
                baselineFcr={baselineData?.fcr || 0}
                scenarioFcr={Number(scenarioFcr) || baselineData?.fcr || 0}
              />
            </TabsContent>

            <TabsContent value="details" className="mt-0">
              <div className="glass p-8 rounded-2xl border-white/40">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-primary uppercase tracking-widest">
                      Technical Audit
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground mt-1">
                      Detailed nutrient balance & emission intensities.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-bold py-2 px-4 bg-primary/10 border-primary/30 text-primary uppercase tracking-[0.2em]"
                  >
                    Tier 2 Engine (v4.3)
                  </Badge>
                </div>

                <div className="overflow-hidden border border-white/30 rounded-2xl bg-white/10 backdrop-blur-lg">
                  <Table>
                    <TableHeader className="bg-primary/10 backdrop-blur-xl">
                      <TableRow className="hover:bg-transparent border-white/20 h-14">
                        <TableHead className="w-[240px] font-bold text-primary text-[11px] uppercase tracking-widest">
                          Metric
                        </TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-widest border-x border-white/10 px-8">
                          Base
                        </TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-widest bg-primary/5 px-8">
                          Scen
                        </TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-widest bg-white/20 px-8">
                          Δ %
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          label: "Total Nitrogen Excreted",
                          unit: "kg N",
                          key: "nitrogenExcreted",
                          precision: 1,
                        },
                        {
                          label: "Total Ammonia Emissions",
                          unit: "kg NH3",
                          key: "ammoniaEmissions",
                          precision: 2,
                        },
                        {
                          label: "Enteric Methane",
                          unit: "kg CH4",
                          key: "entericMethane",
                          precision: 3,
                        },
                        {
                          label: "Manure Methane",
                          unit: "kg CH4",
                          key: "manureMethane",
                          precision: 3,
                        },
                        {
                          label: "Phosphorus Runoff",
                          unit: "kg P",
                          key: "phosphorusRunoff",
                          precision: 3,
                        },
                        {
                          label: "Direct N2O",
                          unit: "kg N2O",
                          key: "directN2O",
                          precision: 3,
                        },
                        {
                          label: "Indirect N2O",
                          unit: "kg N2O",
                          key: "indirectN2O",
                          precision: 3,
                        },
                        {
                          label: "Net GHG Emissions",
                          unit: "kg CO2e",
                          key: "netGhgEmissions",
                          precision: 0,
                        },
                      ].map((item) => {
                        const baseVal =
                          baselineResults[item.key as keyof EmissionResults];
                        const scenVal = (comparisonResults?.scenario ||
                          baselineResults)[item.key as keyof EmissionResults];
                        const diff = calculateDiff(baseVal, scenVal);

                        return (
                          <TableRow
                            key={item.key}
                            className="hover:bg-white/20 transition-colors border-white/10 h-14"
                          >
                            <TableCell className="py-3 px-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-primary text-base">
                                  {item.label}
                                </span>
                                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
                                  {item.unit}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-slate-600 text-base border-x border-white/10 px-8">
                              {baseVal.toFixed(item.precision)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary text-base bg-primary/5 px-8">
                              {scenVal.toFixed(item.precision)}
                            </TableCell>
                            <TableCell className="text-right bg-white/20 px-8">
                              {formatDiff(diff)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
