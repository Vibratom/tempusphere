
'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This file is intentionally left with a basic configuration
// to support other potential AI features in the template.
// To fully disable AI, you can remove the genkit dependencies from package.json.

export const ai = genkit({
  plugins: [
    googleAI({
      // It is recommended to use a more specific model for production.
      // See: https://firebase.google.com/docs/genkit/models#supported-models
      // gemini-1.5-flash-latest is a good balance of performance and cost.
      // gemini-1.5-pro-latest is a higher quality but more expensive model.
      model: 'gemini-1.5-flash-latest',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
