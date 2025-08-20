
'use server';

/**
 * @fileOverview A flow to fetch weather data for a given location using the free OpenWeatherMap API.
 *
 * - getWeatherData - A function that returns weather data.
 */

import { ai } from '@/ai/genkit';
import {
  WeatherDataInputSchema,
  WeatherDataOutputSchema,
} from '@/ai/types';
import { z } from 'zod';


// This Zod schema is for parsing the response from the OpenWeatherMap API.
const OpenWeatherResponseSchema = z.object({
    weather: z.array(z.object({
        main: z.string(),
        description: z.string(),
    })),
    main: z.object({
        temp: z.number(),
        humidity: z.number(),
    }),
    wind: z.object({
        speed: z.number(),
    }),
    name: z.string(),
});


// We're defining a "flow" here, but it doesn't use a Genkit model.
// It's a server-side function that we can call from our client components.
export const getWeatherData = ai.defineFlow(
  {
    name: 'getWeatherData',
    inputSchema: WeatherDataInputSchema,
    outputSchema: WeatherDataOutputSchema,
  },
  async ({ latitude, longitude }) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if (!apiKey) {
        throw new Error("OpenWeatherMap API key is not configured.");
    }
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        
        // Validate the response with our Zod schema
        const parsedData = OpenWeatherResponseSchema.parse(data);

        // Map the OpenWeatherMap condition to our standard set of conditions.
        const mapCondition = (condition: string): z.infer<typeof WeatherDataOutputSchema>['weatherCondition'] => {
            const lowerCaseCondition = condition.toLowerCase();
            if (lowerCaseCondition.includes('rain')) return 'Rainy';
            if (lowerCaseCondition.includes('snow')) return 'Snowy';
            if (lowerCaseCondition.includes('storm') || lowerCaseCondition.includes('thunder')) return 'Stormy';
            if (lowerCaseCondition.includes('drizzle')) return 'Rainy';
            if (lowerCaseCondition.includes('fog') || lowerCaseCondition.includes('mist')) return 'Foggy';
            if (lowerCaseCondition.includes('cloud')) return 'Cloudy';
            if (lowerCaseCondition.includes('clear')) return 'Sunny';
            return 'Partly Cloudy'; // Default fallback
        }
        
        return {
            temperature: Math.round(parsedData.main.temp),
            weatherCondition: mapCondition(parsedData.weather[0]?.main || 'Cloudy'),
            humidity: parsedData.main.humidity,
            windSpeed: Math.round(parsedData.wind.speed * 3.6), // m/s to km/h
            forecast: `Currently ${parsedData.weather[0]?.description || 'cloudy'} in ${parsedData.name}.`,
        };

    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      // On error, return a default/error structure
      return {
        temperature: 0,
        weatherCondition: 'Cloudy',
        humidity: 0,
        windSpeed: 0,
        forecast: 'Error fetching weather data. Please check your API key and try again.'
      };
    }
  }
);

