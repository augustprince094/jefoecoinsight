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
    ghgSavings: z.number(),
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
  prompt: `You are a Jefo expert poultry consultant, powered by Gemini. Based on the following data for a broiler operation, provide a concise and encouraging advisory text.

Data:
- Feed Additive: {{{inputs.feedAdditive}}}
- Application Type: {{{inputs.applicationType}}}
- Number of Birds: {{{inputs.numberOfBirds}}}
- Calculated ROI: {{{roiData.roi}}}:1
- Total Feed Cost Savings: \${{{roiData.feedCostSavings}}}
- Total GHG Savings: {{{ghgData.ghgSavings}}} kg CO2e

Your advisory should:
1.  Start with a positive and engaging opening celebrating the results.
2.  Briefly summarize the key positive outcomes: a strong ROI, significant feed cost savings (if applicable), and meaningful GHG reduction.
3.  If the application type is 'Matrix', specifically highlight the financial benefit of feed reformulation through the matrix value of the additive.
4.  If the application type is 'On-top', emphasize the performance gains (improved FCR and lower mortality) that drive the positive ROI.
5.  Translate the GHG savings into a more relatable equivalent. Use the fact that 1 kg of CO2e is roughly equivalent to driving 4.1 km in a standard gasoline car. Calculate the total equivalent km and include it in your summary.
6.  Conclude with a powerful statement about how Jefo helps achieve both profitability and sustainability goals.
7.  Keep the tone professional, but accessible and positive. Use bullet points (with asterisks) for the key takeaways. Do not use headers.
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
