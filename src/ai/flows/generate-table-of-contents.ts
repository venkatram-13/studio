// The code is valid Typescript code.
'use server';
/**
 * @fileOverview AI agent that generates a table of contents for a given text.
 *
 * - generateTableOfContents - A function that generates a table of contents for a given text.
 * - GenerateTableOfContentsInput - The input type for the generateTableOfContents function.
 * - GenerateTableOfContentsOutput - The return type for the generateTableOfContents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTableOfContentsInputSchema = z.object({
  text: z
    .string()
    .describe('The text content to generate a table of contents for.'),
});
export type GenerateTableOfContentsInput = z.infer<
  typeof GenerateTableOfContentsInputSchema
>;

const GenerateTableOfContentsOutputSchema = z.object({
  tableOfContents: z
    .string()
    .describe('The generated table of contents in markdown format.'),
});
export type GenerateTableOfContentsOutput = z.infer<
  typeof GenerateTableOfContentsOutputSchema
>;

export async function generateTableOfContents(
  input: GenerateTableOfContentsInput
): Promise<GenerateTableOfContentsOutput> {
  return generateTableOfContentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTableOfContentsPrompt',
  input: {schema: GenerateTableOfContentsInputSchema},
  output: {schema: GenerateTableOfContentsOutputSchema},
  prompt: `You are an expert at creating tables of contents for blog posts.

  Generate a table of contents in markdown format, with collapsable sections where possible, for the following text:

  {{{text}}}
  `,
});

const generateTableOfContentsFlow = ai.defineFlow(
  {
    name: 'generateTableOfContentsFlow',
    inputSchema: GenerateTableOfContentsInputSchema,
    outputSchema: GenerateTableOfContentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
