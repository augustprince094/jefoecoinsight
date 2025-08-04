
export const feedAdditiveData = {
  "Jefo Pro Solution": {
    ghgReductionOnTop: {
      "North America (CA)": 0.045,
      "Latin America (BR)": 0.045,
    }
  },
  "Jefo P(OA+EO)": {
    ghgReductionOnTop: {
      "North America (CA)": 0.035,
      "Latin America (BR)": 0.035,
    }
  },
  "Jefo Xylanase": {
    ghgReductionOnTop: {
      "North America (CA)": 0.052,
      "Latin America (BR)": 0.052,
    }
  }
} as const;

export type FeedAdditiveData = typeof feedAdditiveData;

export const regionalBaselineGHG = {
    "North America (CA)": 2.3, // kg CO2e per kg live weight
    "Asia (PH)": 2.5,
    "Europe (FR)": 2.8,
    "Latin America (BR)": 2.4,
} as const;

export type RegionalBaselineGHG = typeof regionalBaselineGHG;
