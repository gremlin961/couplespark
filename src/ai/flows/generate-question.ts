'use server';
/**
 * @fileOverview Generates engaging questions for couples.
 *
 * - generateNextQuestion - A function that generates a new question.
 * - GenerateNextQuestionInput - The input type for the generateNextQuestion function.
 * - GenerateNextQuestionOutput - The return type for the generateNextQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNextQuestionInputSchema = z.object({
  feedback: z
    .string()
    .optional()
    .describe('Optional feedback on previously generated questions.'),
});
export type GenerateNextQuestionInput = z.infer<typeof GenerateNextQuestionInputSchema>;

const GenerateNextQuestionOutputSchema = z.object({
  question: z.string().describe('A question for couples to discuss.'),
});
export type GenerateNextQuestionOutput = z.infer<typeof GenerateNextQuestionOutputSchema>;

export async function generateNextQuestion(
  input: GenerateNextQuestionInput
): Promise<GenerateNextQuestionOutput> {
  return generateNextQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextQuestionPrompt',
  input: {schema: GenerateNextQuestionInputSchema},
  output: {schema: GenerateNextQuestionOutputSchema},
  prompt: `You are an AI assistant designed to generate thoughtful and engaging one-sentence questions for couples.

  Consider the following feedback on previous questions, if any: {{{feedback}}}

  Generate a new question that is likely to spark meaningful conversation.
  The question should not be generic, but specific and engaging.
  The question should only be one sentence long.

  Output:
  { \"question\": \"<generated question>\" }
  `,
});

const generateNextQuestionFlow = ai.defineFlow(
  {
    name: 'generateNextQuestionFlow',
    inputSchema: GenerateNextQuestionInputSchema,
    outputSchema: GenerateNextQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
