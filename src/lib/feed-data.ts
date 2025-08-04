
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
  region: 'North America (CA)' | 'Asia (PH)' | 'Europe (FR)' | 'Latin America (BR)';
  diets: Diets;
}

export const feedData: RegionFeedData[] = [
  {
    region: 'North America (CA)',
    diets: {
      Starter: [
        { name: 'Corn', quantity: 518.7, cost: 232, carbonFootprint: 0.35 },
        { name: 'Soybean Meal', quantity: 396.0, cost: 624, carbonFootprint: 1.27 },
        { name: 'Soybean Oil', quantity: 43.6, cost: 1600, carbonFootprint: 0.91 },
        { name: 'Synthetic Amino Acid', quantity: 7.8, cost: 2700, carbonFootprint: 3.66 },
        { name: 'Other Raw Materials', quantity: 33.9, cost: 651, carbonFootprint: 3.28 },
      ],
      Grower: [
        { name: 'Corn', quantity: 561.0, cost: 232, carbonFootprint: 0.35 },
        { name: 'Soybean Meal', quantity: 359.6, cost: 624, carbonFootprint: 1.27 },
        { name: 'Soybean Oil', quantity: 46.2, cost: 1600, carbonFootprint: 0.91 },
        { name: 'Synthetic Amino Acid', quantity: 6.3, cost: 2700, carbonFootprint: 3.66 },
        { name: 'Other Raw Materials', quantity: 26.9, cost: 651, carbonFootprint: 3.28 },
      ],
      Finisher: [
        { name: 'Corn', quantity: 619.9, cost: 232, carbonFootprint: 0.35 },
        { name: 'Soybean Meal', quantity: 307.5, cost: 624, carbonFootprint: 1.27 },
        { name: 'Soybean Oil', quantity: 43.1, cost: 1600, carbonFootprint: 0.91 },
        { name: 'Synthetic Amino Acid', quantity: 6.3, cost: 2700, carbonFootprint: 3.66 },
        { name: 'Other Raw Materials', quantity: 23.2, cost: 651, carbonFootprint: 3.28 },
      ]
    }
  },
  {
    region: 'Asia (PH)',
    diets: {
      Starter: [
        { name: 'Corn', quantity: 436.74, cost: 21000, carbonFootprint: 3 },
        { name: 'Soybean Meal', quantity: 375.58, cost: 29800, carbonFootprint: 6 },
        { name: 'Wheat', quantity: 100, cost: 19000, carbonFootprint: 6 },
        { name: 'Coconut Oil', quantity: 30.74, cost: 73000, carbonFootprint: 0.9 },
        { name: 'Fish meal', quantity: 20, cost: 68000, carbonFootprint: 0.9 },
        { name: 'Synthetic Amino Acid', quantity: 5.7, cost: 460000, carbonFootprint: 3.6 },
        { name: 'Other Raw Materials', quantity: 31.23, cost: 56000, carbonFootprint: 3.2 },
      ],
      Grower: [
        { name: 'Corn', quantity: 505.7, cost: 21000, carbonFootprint: 3 },
        { name: 'Soybean Meal', quantity: 316.73, cost: 29800, carbonFootprint: 6 },
        { name: 'Wheat', quantity: 100, cost: 19000, carbonFootprint: 6 },
        { name: 'Coconut Oil', quantity: 22.62, cost: 73000, carbonFootprint: 0.9 },
        { name: 'Fish meal', quantity: 27.5, cost: 68000, carbonFootprint: 0.9 },
        { name: 'Synthetic Amino Acid', quantity: 5.33, cost: 46000, carbonFootprint: 3.6 },
        { name: 'Other Raw Materials', quantity: 22.1, cost: 36000, carbonFootprint: 3.2 },
      ],
      Finisher: [
        { name: 'Corn', quantity: 542.5, cost: 21000, carbonFootprint: 3 },
        { name: 'Soybean Meal', quantity: 271.66, cost: 29800, carbonFootprint: 6 },
        { name: 'Wheat', quantity: 100, cost: 19, carbonFootprint: 6 },
        { name: 'Coconut Oil', quantity: 31.20, cost: 73000, carbonFootprint: 0.9 },
        { name: 'Fish meal', quantity: 30, cost: 68000, carbonFootprint: 0.9 },
        { name: 'Synthetic Amino Acid', quantity: 4.83, cost: 46000, carbonFootprint: 3.6 },
        { name: 'Other Raw Materials', quantity: 19.9, cost: 36000, carbonFootprint: 3.2 },
      ]
    }
  },
  {
    region: 'Europe (FR)',
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
  {
    region: 'Latin America (BR)',
    diets: {
      Starter: [
        { name: 'Corn', quantity: 55.764, cost: 970, carbonFootprint: 0.17 },
        { name: 'Soybean Meal', quantity: 35.595, cost: 2000, carbonFootprint: 1.32 },
        { name: 'Soybean Oil', quantity: 2.009, cost: 4300, carbonFootprint: 4.24 },
        { name: 'Meat and bone meal', quantity: 4.564, cost: 1250, carbonFootprint: 0.0217 },
        { name: 'Calcium carbonate', quantity: 0.564, cost: 340, carbonFootprint: 1.30 },
        { name: 'Methionine', quantity: 0.383, cost: 12000, carbonFootprint: 2.8 },
        { name: 'Lysine', quantity: 0.24, cost: 10000, carbonFootprint: 3.399 },
        { name: 'Threonine', quantity: 0.087, cost: 9200, carbonFootprint: 4.14 },
        { name: 'Microingredients', quantity: 0.793, cost: 500, carbonFootprint: 1.1045 },
      ],
      Grower: [
        { name: 'Corn', quantity: 60.414, cost: 970, carbonFootprint: 0.17 },
        { name: 'Soybean Meal', quantity: 31.528, cost: 2000, carbonFootprint: 1.32 },
        { name: 'Soybean Oil', quantity: 3.613, cost: 4300, carbonFootprint: 4.24 },
        { name: 'Meat and bone meal', quantity: 2.531, cost: 1250, carbonFootprint: 0.0217 },
        { name: 'Calcium carbonate', quantity: 0.788, cost: 340, carbonFootprint: 1.30 },
        { name: 'Methionine', quantity: 0.306, cost: 12000, carbonFootprint: 2.8 },
        { name: 'Lysine', quantity: 0.119, cost: 10000, carbonFootprint: 3.399 },
        { name: 'Threonine', quantity: 0.042, cost: 9200, carbonFootprint: 4.14 },
        { name: 'Microingredients', quantity: 0.658, cost: 500, carbonFootprint: 1.1045 },
      ],
      Finisher: [
        { name: 'Corn', quantity: 66.487, cost: 970, carbonFootprint: 0.17 },
        { name: 'Soybean Meal', quantity: 26.411, cost: 2000, carbonFootprint: 1.32 },
        { name: 'Soybean Oil', quantity: 3.355, cost: 4300, carbonFootprint: 4.24 },
        { name: 'Meat and bone meal', quantity: 1.96, cost: 1250, carbonFootprint: 0.0217 },
        { name: 'Calcium carbonate', quantity: 0.739, cost: 340, carbonFootprint: 1.30 },
        { name: 'Methionine', quantity: 0.249, cost: 12000, carbonFootprint: 2.8 },
        { name: 'Lysine', quantity: 0.165, cost: 10000, carbonFootprint: 3.399 },
        { name: 'Threonine', quantity: 0.014, cost: 9200, carbonFootprint: 4.14 },
        { name: 'Microingredients', quantity: 0.62, cost: 500, carbonFootprint: 1.1045 },
      ]
    }
  }
];
