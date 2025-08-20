import { z } from 'zod';

/**
 * @fileOverview Shared types for AI flows
 */

export const AstronomicalDataInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type AstronomicalDataInput = z.infer<typeof AstronomicalDataInputSchema>;

export const AstronomicalDataOutputSchema = z.object({
  sunrise: z.string().describe("The time of sunrise in HH:MM format for the user's local timezone."),
  sunset: z.string().describe("The time of sunset in HH:MM format for the user's local timezone."),
  moonrise: z.string().describe("The time of moonrise in HH:MM format for the user's local timezone. Can be 'N/A' if the moon does not rise on the given day."),
  moonset: z.string().describe("The time of moonset in HH:MM format for the user's local timezone. Can be 'N/A' if the moon does not set on the given day."),
  moonPhase: z.string().describe('The current phase of the moon (e.g., "Waxing Crescent", "Full Moon").'),
});
export type AstronomicalDataOutput = z.infer<typeof AstronomicalDataOutputSchema>;


export const WeatherDataInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type WeatherDataInput = z.infer<typeof WeatherDataInputSchema>;

export const WeatherDataOutputSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    weatherCondition: z.enum(['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy', 'Windy']).describe('A single-word description of the current weather condition.'),
    humidity: z.number().describe('The current humidity percentage.'),
    windSpeed: z.number().describe('The current wind speed in km/h.'),
    forecast: z.string().describe('A brief forecast for the next 24 hours.'),
});
export type WeatherDataOutput = z.infer<typeof WeatherDataOutputSchema>;
