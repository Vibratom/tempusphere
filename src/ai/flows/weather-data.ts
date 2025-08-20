'use server';

/**
 * @fileOverview A flow to fetch weather data for a given location using an AI model.
 *
 * - getWeatherData - A function that returns weather data.
 */

import { ai } from '@/ai/genkit';
import {
  WeatherDataInputSchema,
  WeatherDataOutputSchema,
} from '@/ai/types';

const weatherPrompt = ai.definePrompt({
    name: 'weatherPrompt',
    input: { schema: WeatherDataInputSchema },
    output: { schema: WeatherDataOutputSchema },
    prompt: `You are a weather API. Given the latitude and longitude, provide the current weather conditions, temperature in Celsius, humidity, wind speed in km/h, and a short forecast for the next 24 hours. The weatherCondition should be one of: 'Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy', 'Windy'.

    Latitude: {{latitude}}
    Longitude: {{longitude}}
    `,
});

export const getWeatherData = ai.defineFlow(
  {
    name: 'getWeatherData',
    inputSchema: WeatherDataInputSchema,
    outputSchema: WeatherDataOutputSchema,
  },
  async (input) => {
    const { output } = await weatherPrompt(input);
    if (!output) {
      throw new Error('Could not fetch weather data from AI.');
    }
    return output;
  }
);
