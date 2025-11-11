
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
import { googleAI } from '@genkit-ai/google-genai';

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
  keyBenefit: z.string().describe('A single, concise key benefit of the selected additive.'),
});
export type ProvideAdvisoryOutput = z.infer<typeof ProvideAdvisoryOutputSchema>;

const advisoryPrompt = ai.definePrompt({
  name: 'provideAdvisoryPrompt',
  model: googleAI.model('gemini-1.5-pro-latest'),
  inputSchema: AdvisoryInputSchema,
  output: {
      format: 'json',
      schema: ProvideAdvisoryOutputSchema,
  },
  prompt: `You are a Jefo expert poultry consultant. Your task is to provide a concise key benefit based on the user's selected additive.

You must respond in a valid JSON format. The output should be a JSON object that matches the following schema:
{
  "keyBenefit": "string (A single, concise key benefit of the selected additive.)"
}

**Input Data:**
- Feed Additive: {{{inputs.feedAdditive}}}
- Application Type: {{{inputs.applicationType}}}

**Instructions:**

1.  **Select a Key Benefit (for the 'keyBenefit' field):**
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
- Populate the \`keyBenefit\` field in the output schema.
- Do not use bullet points, headers, or any extra formatting in the string.
`,
});

export async function provideAdvisory(input: ProvideAdvisoryInput): Promise<ProvideAdvisoryOutput> {
  const response = await advisoryPrompt(input);
  const output = response.output();
  if (!output) {
    throw new Error("The model failed to return valid advisory output.");
  }
  return output;
}
