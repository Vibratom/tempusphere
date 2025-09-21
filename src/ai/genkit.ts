
'use server';
/**
 * @fileOverview A file that initializes the Genkit AI singleton.
 */

import {genkit} from 'genkit';
// The Google AI plugin has been removed as per user request.

// Initialize the AI singleton.
export const ai = genkit({
  plugins: [],
});
