
'use server';

/**
 * @fileOverview An AI flow for suggesting optimal meeting times across timezones.
 * 
 * - suggestMeetingTimes - A function that handles finding good meeting times.
 * - SuggestMeetingTimesInput - The input type for the suggestMeetingTimes function.
 * - SuggestMeetingTimesOutput - The return type for the suggestMeetingTimes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestMeetingTimesInputSchema = z.object({
  timezones: z.array(z.string()).describe('A list of IANA timezone strings for all meeting participants.'),
});
export type SuggestMeetingTimesInput = z.infer<typeof SuggestMeetingTimesInputSchema>;

const SuggestionSchema = z.object({
    times: z.record(z.string()).describe('An object where keys are the requested timezones and values are the suggested meeting time in that timezone, formatted as "HH:mm (Day)". For example: "14:00 (Today)" or "09:30 (Tomorrow)".'),
    isIdeal: z.boolean().describe('Whether this suggestion falls within standard 9am-5pm business hours for ALL timezones.'),
});

const SuggestMeetingTimesOutputSchema = z.object({
  summary: z.string().describe('A brief, one-sentence summary of the recommendation. For example, "The best overlap is in your late afternoon, which is the morning for them."'),
  suggestions: z.array(SuggestionSchema).describe('A list of 3-5 potential meeting time suggestions.'),
});
export type SuggestMeetingTimesOutput = z.infer<typeof SuggestMeetingTimesOutputSchema>;

export async function suggestMeetingTimes(input: SuggestMeetingTimesInput): Promise<SuggestMeetingTimesOutput> {
  return suggestMeetingTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMeetingTimesPrompt',
  input: { schema: SuggestMeetingTimesInputSchema },
  output: { schema: SuggestMeetingTimesOutputSchema },
  prompt: `
    You are an expert meeting scheduler and timezone assistant.
    Your task is to find the best possible meeting times for a group of people in different timezones.

    The current date is {{currentDate}}. The user is in the {{userTimezone}} timezone.

    The participants are in the following timezones:
    {{#each timezones}}
    - {{{this}}}
    {{/each}}

    Please suggest 3-5 optimal meeting times. For each suggestion, provide the corresponding local time for each timezone.
    
    "Optimal" means:
    1.  The time should fall within standard business hours (roughly 9:00 to 17:00 / 9am to 5pm) in as many of the specified timezones as possible.
    2.  Prioritize times that are convenient for the majority of participants.
    3.  If there's no perfect overlap, find the most reasonable compromise (e.g., one person starting a bit early or another staying a bit late).

    For each suggestion you provide:
    - Mark 'isIdeal' as true ONLY if the suggested time falls within the 9:00-17:00 window for EVERYONE. Otherwise, it must be false.
    - The output times should be formatted as "HH:mm (Day)", for example "14:00 (Today)" or "09:30 (Tomorrow)".

    Start with a brief, one-sentence summary of your findings, then provide the structured list of suggestions.
  `,
});

const suggestMeetingTimesFlow = ai.defineFlow(
  {
    name: 'suggestMeetingTimesFlow',
    inputSchema: SuggestMeetingTimesInputSchema,
    outputSchema: SuggestMeetingTimesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
        ...input,
        currentDate: new Date().toLocaleDateString('en-CA'),
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (!output) {
      throw new Error('The AI model did not return a valid response.');
    }
    return output;
  }
);
