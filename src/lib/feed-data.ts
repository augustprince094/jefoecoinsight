
export interface FeedIngredient {
  name: string;
  /** Quantity of the ingredient in kg per ton of feed. */
  quantity: number;
  /** Cost of the ingredient in $ per ton. */
  cost: number;
  /** Carbon footprint factor (e.g., kg CO2e per kg of ingredient). */
  carbonFootprint: number;
}

export interface RegionFeedData {
  region: 'Canada' | 'Asia' | 'Europe';
  ingredients: FeedIngredient[];
}

export const feedData: RegionFeedData[] = [
  {
    region: 'Canada',
    ingredients: [
      { name: 'Corn', quantity: 579, cost: 232, carbonFootprint: 2 },
      { name: 'Soybean Meal', quantity: 343.3, cost: 624, carbonFootprint: 5 },
      { name: 'Soybean Oil', quantity: 44.6, cost: 624, carbonFootprint: 5 },
      { name: 'Synthetic Amino Acid', quantity: 6.5, cost: 624, carbonFootprint: 5 },
      { name: 'Other Raw Materials', quantity: 26.4, cost: 624, carbonFootprint: 5 },
    ],
  },
  {
    region: 'Asia',
    ingredients: [
      { name: 'Corn', quantity: 550, cost: 250, carbonFootprint: 3 },
      { name: 'Soybean Meal', quantity: 360, cost: 600, carbonFootprint: 6 },
      { name: 'Soybean Oil', quantity: 45, cost: 600, carbonFootprint: 6 },
      { name: 'Synthetic Amino Acid', quantity: 7, cost: 600, carbonFootprint: 6 },
      { name: 'Other Raw Materials', quantity: 30, cost: 600, carbonFootprint: 6 },
    ],
  },
  {
    region: 'Europe',
    ingredients: [
      { name: 'Corn', quantity: 600, cost: 260, carbonFootprint: 1 },
      { name: 'Soybean Meal', quantity: 320, cost: 650, carbonFootprint: 4 },
      { name: 'Soybean Oil', quantity: 40, cost: 650, carbonFootprint: 4 },
      { name: 'Synthetic Amino Acid', quantity: 6, cost: 650, carbonFootprint: 4 },
      { name: 'Other Raw Materials', quantity: 34, cost: 650, carbonFootprint: 4 },
    ],
  },
];
