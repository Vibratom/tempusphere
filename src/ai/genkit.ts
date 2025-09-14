
'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This file is intentionally left with a basic configuration
// to support other potential AI features in the template.
// To fully disable AI, you can remove the genkit dependencies from package.json.

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
