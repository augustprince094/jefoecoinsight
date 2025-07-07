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
  advisoryText: z.string().describe('The AI-generated advisory text.'),
});
export type ProvideAdvisoryOutput = z.infer<typeof ProvideAdvisoryOutputSchema>;

export async function provideAdvisory(input: ProvideAdvisoryInput): Promise<ProvideAdvisoryOutput> {
  return provideAdvisoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAdvisoryPrompt',
  input: {schema: AdvisoryInputSchema},
  output: {schema: ProvideAdvisoryOutputSchema},
  prompt: `You are a Jefo expert poultry consultant. Your task is to provide a very concise, two-part advisory based on calculator results.

**Input Data:**
- Feed Additive: {{{inputs.feedAdditive}}}
- Application Type: {{{inputs.applicationType}}}
- Calculated ROI: {{{roiData.roi}}}:1
- Total GHG Savings: {{{ghgData.ghgSavings}}} tons CO2e

**Instructions:**

1.  **Craft a Summary (1-2 lines):**
    *   Begin with a positive, engaging sentence summarizing the excellent ROI and GHG savings.
    *   Calculate the equivalent kilometers driven for the GHG savings (Total GHG Savings * 4100).
    *   Example opening: "Impressive results! Using {{{inputs.feedAdditive}}} not only delivers a strong {{{roiData.roi}}}:1 return on investment but also reduces emissions equivalent to driving [calculated km] km."
    *   This summary must be no more than two lines.

2.  **Add a Key Benefit (1 sentence):**
    *   After the summary, add a new paragraph containing a single, concise key benefit for the selected additive.
    *   Choose the *exact* sentence from the "Key Benefit Options" below that matches the user's selected \`feedAdditive\` and \`applicationType\`.

**Key Benefit Options (Use one of these verbatim):**

*   **If feedAdditive is 'Jefo Pro Solution':**
    *   And \`applicationType\` is 'Matrix': "It reduces feed cost without compromising performance when formulated based on its recommended nutrition matrix."
    *   And \`applicationType\` is 'On-top': "During heat stress situations, its use can drastically reduce total mortality."

*   **If feedAdditive is 'Jefo P(OA+EO)':**
    *   (This is always 'On-top'): "It is a proven and effective strategy to help reduce the count of Salmonella Typhimurium in broiler chickens."

*   **If feedAdditive is 'Jefo Xylanase':**
    *   And \`applicationType\` is 'Matrix': "It allows for the use of reduced-energy diets, improving growth performance while lowering feed costs."
    *   And \`applicationType\` is 'On-top': "It is a reliable solution for achieving better performance, improved footpad quality, and greater economic returns."

**Final Output:**
- The \`advisoryText\` field should contain the final combined text.
- Do not use bullet points, headers, or any extra formatting.
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
