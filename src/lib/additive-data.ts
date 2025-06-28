
export const feedAdditiveData = {
  "Jefo Pro Solution": {
    ghgReductionOnTop: {
      Canada: 0.045,
    }
  },
  "Jefo P(OA+EO)": {
    ghgReductionOnTop: {
      Canada: 0.035,
    }
  },
  "Jefo Xylanase": {
    ghgReductionOnTop: {
      Canada: 0.052,
    }
  }
} as const;

export type FeedAdditiveData = typeof feedAdditiveData;

export const regionalBaselineGHG = {
    Canada: 2.3, // kg CO2e per kg live weight
    Asia: 2.5,
    Europe: 2.8
} as const;

export type RegionalBaselineGHG = typeof regionalBaselineGHG;
