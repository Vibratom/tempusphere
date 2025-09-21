
'use server';
/**
 * @fileOverview A file that initializes the Genkit AI singleton.
 */

import {genkit} from 'genkit';
import {googleAI} from 'genkit/plugins/googleai';

// Initialize the AI singleton.
export const ai = genkit({
  plugins: [googleAI()],
});
