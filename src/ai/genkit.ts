
import {genkit} from 'genkit';
import {vertexAI} from '@genkit-ai/vertexai'; // Import the Vertex AI plugin

export const ai = genkit({
  plugins: [
    vertexAI({
      project: 'rkiles-demo-host-vpc', // Your Google Cloud project ID
      location: 'us-central1', // Specify your Vertex AI location, e.g., 'us-central1'
    }),
  ],
  model: 'vertexai/gemini-2.0-flash-001', // Default model for Vertex AI
  // You can remove the explicit 'model' line here if you prefer to set it in each flow,
  // or ensure this default model is available in your Vertex AI project and location.
});
