
'use server';
/**
 * @fileOverview A file that initializes the Genkit AI singleton.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize the AI singleton.
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
});
