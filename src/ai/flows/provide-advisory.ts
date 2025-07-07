'use server';
/**
 * @fileOverview An AI flow to provide expert advisory based on calculator results.
 *
 * - provideAdvisory - A function that generates a textual summary and advice.
 * - ProvideAdvisoryInput - The input type for the provideAdvisory function.
 * - ProvideAdvisoryOutput - The return type for the provideAdvisory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvisoryInputSchema = z.object({
  inputs: z.object({
    feedAdditive: z.string(),
    applicationType: z.string().optional(),
    numberOfBirds: z.number(),
  }),
  roiData: z.object({
    roi: z.number(),
    feedCostSavings: z.number(),
  }),
  ghgData: z.object({
    ghgSavings: z.number().describe('The total GHG savings in tons CO2e.'),
  }),
});
export type ProvideAdvisoryInput = z.infer<typeof AdvisoryInputSchema>;

const ProvideAdvisoryOutputSchema = z.object({
  summary: z.string().describe('A concise, one-to-two line summary of the ROI and GHG savings.'),
  keyBenefit: z.string().describe('A single, concise key benefit of the selected additive.'),
});
export type ProvideAdvisoryOutput = z.infer<typeof ProvideAdvisoryOutputSchema>;

export async function provideAdvisory(input: ProvideAdvisoryInput): Promise<ProvideAdvisoryOutput> {
  return provideAdvisoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAdvisoryPrompt',
  input: {schema: AdvisoryInputSchema},
  output: {schema: ProvideAdvisoryOutputSchema},
  prompt: `You are a Jefo expert poultry consultant. Your task is to provide a concise, two-part advisory based on calculator results.

**Input Data:**
- Feed Additive: {{{inputs.feedAdditive}}}
- Application Type: {{{inputs.applicationType}}}
- Calculated ROI: {{{roiData.roi}}}:1
- Total GHG Savings: {{{ghgData.ghgSavings}}} tons CO2e

**Instructions:**

1.  **Craft a Summary (for the 'summary' field):**
    *   Create a positive, engaging sentence summarizing the ROI and GHG savings. This summary must be no more than two lines.
    *   **Important: Format the ROI value to one decimal place.**
    *   Calculate the equivalent kilometers driven for the GHG savings (Total GHG Savings * 4100).
    *   Example: "Impressive results! Using {{{inputs.feedAdditive}}} not only delivers a strong 8.5:1 return on investment but also reduces emissions equivalent to driving [calculated km] km."

2.  **Select a Key Benefit (for the 'keyBenefit' field):**
    *   Choose the *exact* sentence from the "Key Benefit Options" below that matches the user's selected \`feedAdditive\` and \`applicationType\`.

**Key Benefit Options (Use one of these verbatim):**

*   **If feedAdditive is 'Jefo Pro Solution':**
    *   And \`applicationType\` is 'Matrix': "Jefo Pro Solution can reduce feed cost without compromising performance when added to broiler diets containing either traditional or alternative feed ingredients and formulated based on its recommended nutrition matrix."
    *   And \`applicationType\` is 'On-top': "During heat stress situations, the use of Jefo Pro Solution, both in regular feeds and low density feeds, drastically reduces total mortality."

*   **If feedAdditive is 'Jefo P(OA+EO)':**
    *   (This is always 'On-top'): "The use of Jefo P(OA+EO) is an efficient strategy to reduce Salmonella Typhimurium counts in broiler chickens."

*   **If feedAdditive is 'Jefo Xylanase':**
    *   And \`applicationType\` is 'Matrix': "Jefo Xylanase can be used in reduced energy corn-soybean based diets to improve growth performance and reduce cost of broiler diets."
    *   And \`applicationType\` is 'On-top': "Jefo Xylanase is a reliable solution for better performance, improves footpad quality and economic returns."

**Final Output:**
- Populate the \`summary\` and \`keyBenefit\` fields in the output schema.
- Do not use bullet points, headers, or any extra formatting in the strings.
`,
});

const provideAdvisoryFlow = ai.defineFlow(
  {
    name: 'provideAdvisoryFlow',
    inputSchema: AdvisoryInputSchema,
    outputSchema: ProvideAdvisoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
