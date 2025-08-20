'use server';

/**
 * @fileOverview A flow to fetch astronomical data for a given location using a free public API.
 *
 * - getAstronomicalData - A function that returns sun data.
 */

import { ai } from '@/ai/genkit';
import {
  AstronomicalDataInput,
  AstronomicalDataInputSchema,
  AstronomicalDataOutput,
  AstronomicalDataOutputSchema,
} from '@/ai/types';
import { z } from 'zod';

// We're defining a "flow" here, but it doesn't use a Genkit model.
// It's a server-side function that we can call from our client components.
export const getAstronomicalData = ai.defineFlow(
  {
    name: 'getAstronomicalData',
    inputSchema: AstronomicalDataInputSchema,
    outputSchema: AstronomicalDataOutputSchema,
  },
  async ({ latitude, longitude }) => {
    try {
      const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data = await response.json();

      if (data.status !== 'OK' || !data.results) {
        throw new Error('Invalid data returned from API');
      }

      // Convert ISO strings to HH:MM format in local time
      const formatTime = (isoString: string) => {
        if(!isoString) return "N/A";
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }

      return {
        sunrise: formatTime(data.results.sunrise),
        sunset: formatTime(data.results.sunset),
        // The API doesn't provide moon data, so we return N/A
        moonrise: 'N/A',
        moonset: 'N/A',
        moonPhase: 'N/A'
      };
    } catch (error) {
      console.error("Failed to fetch astronomical data:", error);
      // On error, return a default/error structure
      return {
        sunrise: 'Error',
        sunset: 'Error',
        moonrise: 'N/A',
        moonset: 'N/A',
        moonPhase: 'N/A'
      };
    }
  }
);
