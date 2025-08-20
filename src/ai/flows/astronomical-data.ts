'use server';

/**
 * @fileOverview An AI flow to fetch astronomical data for a given location.
 *
 * - getAstronomicalData - A function that returns sun and moon data.
 */

import { ai } from '@/ai/genkit';
import {
  AstronomicalDataInput,
  AstronomicalDataInputSchema,
  AstronomicalDataOutput,
  AstronomicalDataOutputSchema,
} from '@/ai/types';


export async function getAstronomicalData(input: AstronomicalDataInput): Promise<AstronomicalDataOutput> {
  return astronomicalDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'astronomicalDataPrompt',
  input: { schema: AstronomicalDataInputSchema },
  output: { schema: AstronomicalDataOutputSchema },
  prompt: `
    You are an expert astronomer.
    For the given latitude: {{{latitude}}} and longitude: {{{longitude}}}, provide the astronomical data for today's date.
    Provide all times in the local timezone of the given coordinates.
    If the moon does not rise or set on the current date for the location, return 'N/A' for the respective field.
  `,
});

const astronomicalDataFlow = ai.defineFlow(
  {
    name: 'astronomicalDataFlow',
    inputSchema: AstronomicalDataInputSchema,
    outputSchema: AstronomicalDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
