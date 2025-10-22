import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
      apiVersion: 'v1', // Force the use of the v1 API
    }),
  ],
});

// Set the default model for all `ai.generate()` calls that don't specify one.
ai.model = googleAI.model('gemini-1.5-flash');
