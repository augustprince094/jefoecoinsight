
export interface FeedIngredient {
  name: string;
  /** Quantity of the ingredient in kg per ton of feed. */
  quantity: number;
  /** Cost of the ingredient in $ per ton. */
  cost: number;
  /** Carbon footprint factor (e.g., kg CO2e per kg of ingredient). */
  carbonFootprint: number;
}

export interface Diets {
  Starter: FeedIngredient[];
  Grower: FeedIngredient[];
  Finisher: FeedIngredient[];
}

export interface RegionFeedData {
  region: 'Canada' | 'Asia' | 'Europe';
  diets: Diets;
}

export const feedData: RegionFeedData[] = [
  {
    region: 'Canada',
    diets: {
      Starter: [
        { name: 'Corn', quantity: 579.2, cost: 232, carbonFootprint: 0.35 },
        { name: 'Soybean Meal', quantity: 343.3, cost: 624, carbonFootprint: 1.27 },
        { name: 'Soybean Oil', quantity: 44.6, cost: 1600, carbonFootprint: 0.91 },
        { name: 'Synthetic Amino Acid', quantity: 6.5, cost: 2854, carbonFootprint: 3.66 },
        { name: 'Other Raw Materials', quantity: 26.4, cost: 572, carbonFootprint: 3.28 },
      ],
      Grower: [
        { name: 'Corn', quantity: 561.001, cost: 232, carbonFootprint: 0.35 },
        { name: 'Soybean Meal', quantity: 359.624, cost: 624, carbonFootprint: 1.27 },
        { name: 'Soybean Oil', quantity: 46.21, cost: 1600, carbonFootprint: 0.91 },
        { name: 'Synthetic Amino Acid', quantity: 6.27, cost: 2854, carbonFootprint: 3.66 },
        { name: 'Other Raw Materials', quantity: 26.88, cost: 572, carbonFootprint: 3.28 },
      ],
      Finisher: [
        { name: 'Corn', quantity: 619.87, cost: 232, carbonFootprint: 0.35 },
        { name: 'Soybean Meal', quantity: 307.48, cost: 624, carbonFootprint: 1.27 },
        { name: 'Soybean Oil', quantity: 43.14, cost: 1600, carbonFootprint: 0.91 },
        { name: 'Synthetic Amino Acid', quantity: 6.26, cost: 2854, carbonFootprint: 3.66 },
        { name: 'Other Raw Materials', quantity: 23.27, cost: 572, carbonFootprint: 3.28 },
      ]
    }
  },
  {
    region: 'Asia',
    diets: {
      Starter: [
        { name: 'Corn', quantity: 550, cost: 250, carbonFootprint: 3 },
        { name: 'Soybean Meal', quantity: 360, cost: 600, carbonFootprint: 6 },
        { name: 'Soybean Oil', quantity: 45, cost: 1500, carbonFootprint: 0.9 },
        { name: 'Synthetic Amino Acid', quantity: 7, cost: 2800, carbonFootprint: 3.6 },
        { name: 'Other Raw Materials', quantity: 30, cost: 550, carbonFootprint: 3.2 },
      ],
      Grower: [
        { name: 'Corn', quantity: 590, cost: 250, carbonFootprint: 3 },
        { name: 'Soybean Meal', quantity: 310, cost: 600, carbonFootprint: 6 },
        { name: 'Soybean Oil', quantity: 55, cost: 1500, carbonFootprint: 0.9 },
        { name: 'Synthetic Amino Acid', quantity: 6, cost: 2800, carbonFootprint: 3.6 },
        { name: 'Other Raw Materials', quantity: 32, cost: 550, carbonFootprint: 3.2 },
      ],
      Finisher: [
        { name: 'Corn', quantity: 620, cost: 250, carbonFootprint: 3 },
        { name: 'Soybean Meal', quantity: 270, cost: 600, carbonFootprint: 6 },
        { name: 'Soybean Oil', quantity: 65, cost: 1500, carbonFootprint: 0.9 },
        { name: 'Synthetic Amino Acid', quantity: 5, cost: 2800, carbonFootprint: 3.6 },
        { name: 'Other Raw Materials', quantity: 35, cost: 550, carbonFootprint: 3.2 },
      ]
    }
  },
  {
    region: 'Europe',
    diets: {
      Starter: [
        { name: 'Corn', quantity: 600, cost: 260, carbonFootprint: 1 },
        { name: 'Soybean Meal', quantity: 320, cost: 650, carbonFootprint: 4 },
        { name: 'Soybean Oil', quantity: 40, cost: 1700, carbonFootprint: 1.1 },
        { name: 'Synthetic Amino Acid', quantity: 6, cost: 2900, carbonFootprint: 3.8 },
        { name: 'Other Raw Materials', quantity: 34, cost: 600, carbonFootprint: 3.4 },
      ],
      Grower: [
        { name: 'Corn', quantity: 630, cost: 260, carbonFootprint: 1 },
        { name: 'Soybean Meal', quantity: 280, cost: 650, carbonFootprint: 4 },
        { name: 'Soybean Oil', quantity: 50, cost: 1700, carbonFootprint: 1.1 },
        { name: 'Synthetic Amino Acid', quantity: 5, cost: 2900, carbonFootprint: 3.8 },
        { name: 'Other Raw Materials', quantity: 35, cost: 600, carbonFootprint: 3.4 },
      ],
      Finisher: [
        { name: 'Corn', quantity: 660, cost: 260, carbonFootprint: 1 },
        { name: 'Soybean Meal', quantity: 240, cost: 650, carbonFootprint: 4 },
        { name: 'Soybean Oil', quantity: 60, cost: 1700, carbonFootprint: 1.1 },
        { name: 'Synthetic Amino Acid', quantity: 4, cost: 2900, carbonFootprint: 3.8 },
        { name: 'Other Raw Materials', quantity: 36, cost: 600, carbonFootprint: 3.4 },
      ]
    }
  },
];
