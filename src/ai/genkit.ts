import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
      apiVersion: 'v1', // Force the use of the v1 API
    }),
  ],
  model: googleAI.model('gemini-1.5-flash'),
});
