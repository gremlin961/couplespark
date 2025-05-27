import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {getGoogleApiKey} from '@/lib/secrets'; // Import the new function

// Fetch the API key from Secret Manager.
// Note: This top-level await makes this module an async module.
// Modules importing 'ai' will implicitly wait for this to complete.
const apiKey = await getGoogleApiKey();

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey, // Use the fetched API key
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
