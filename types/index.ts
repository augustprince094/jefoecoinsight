export type AnimalType =
  | "broilers"
  | "swine-sow"
  | "swine-nursery"
  | "swine-grow-finish";

export type AWMS =
  | "lagoon"
  | "liquid-slurry"
  | "poultry-litter"
  | "solid-storage"
  | "pit-long-term";
export type FeedAdditive =
  | "none"
  | "jefo-pro"
  | "poa-eo"
  | "xylanase"
  | "jefo-combo";
export type Region =
  | "Western Europe"
  | "Eastern Europe"
  | "Asia"
  | "Africa"
  | "North America"
  | "Latin America";

export type FarmData = {
  animalType: AnimalType;
  region?: Region;
  awms?: AWMS;
  count: number;
  fcr: number; // Feed Conversion Ratio
  cyclesPerYear: number;
  feedCrudeProtein: number; // percentage
  phase1CP?: number;
  phase2CP?: number;
  phase3CP?: number;
  feedPhosphorus: number; // percentage
  phase1P?: number;
  phase2P?: number;
  phase3P?: number;
  manureManagement: "lagoon" | "solid" | "slurry" | "dry-lot" | "pit-long-term";
  avgWeight: number; // kg
  additive: FeedAdditive;
  moistureContent: number; // Dietary Moisture Content (%)
  // Experimental Data Fields
  useExperimentalData?: boolean;
  useExperimentalN?: boolean;
  useExperimentalP?: boolean;
  fecalN?: number; // Single input for cycle fecal nitrogen %
  fecalP?: number; // Single input for cycle fecal phosphorus %
  cycleDurationDays?: number;
  // Sow Specific Fields
  pigletsPerLitter?: number;
  avgLitterWeight?: number;
  gestationFeedIntake?: number;
  lactationFeedIntake?: number;
};

export interface EmissionResults {
  nitrogenExcreted: number; // kg/cycle
  ammoniaEmissions: number; // kg NH3/cycle
  entericMethane: number; // kg CH4/cycle
  manureMethane: number; // kg CH4/cycle
  phosphorusRunoff: number; // kg/cycle
  directN2O: number; // kg N2O/cycle
  indirectN2O: number; // kg N2O/cycle
  netGhgEmissions: number; // kg CO2e/cycle
}

export interface ComparativeResults {
  baseline: EmissionResults;
  scenario: EmissionResults;
  additiveType: FeedAdditive;
}