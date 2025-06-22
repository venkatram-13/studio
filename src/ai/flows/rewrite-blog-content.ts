// This file is machine-generated - edit with caution!

'use server';

/**
 * @fileOverview Rewrites blog content to improve readability and engagement.
 *
 * - rewriteBlogContent - A function that rewrites blog content.
 * - RewriteBlogContentInput - The input type for the rewriteBlogContent function.
 * - RewriteBlogContentOutput - The return type for the rewriteBlogContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteBlogContentInputSchema = z.object({
  content: z
    .string()
    .describe('The blog content to rewrite. Can be text or a blog URL.'),
  title: z.string().describe('The title of the blog.'),
  imageUrl: z.string().describe('The URL of the blog image.'),
  applyLink: z.string().describe('The link for users to apply.'),
});
export type RewriteBlogContentInput = z.infer<typeof RewriteBlogContentInputSchema>;

const RewriteBlogContentOutputSchema = z.object({
  rewrittenContent: z.string().describe('The rewritten blog content with a table of contents.'),
});
export type RewriteBlogContentOutput = z.infer<typeof RewriteBlogContentOutputSchema>;

export async function rewriteBlogContent(input: RewriteBlogContentInput): Promise<RewriteBlogContentOutput> {
  return rewriteBlogContentFlow(input);
}

const rewriteBlogContentPrompt = ai.definePrompt({
  name: 'rewriteBlogContentPrompt',
  input: {schema: RewriteBlogContentInputSchema},
  output: {schema: RewriteBlogContentOutputSchema},
  prompt: `You are an expert blog content writer.

You will rewrite the given blog content to improve readability and engagement.
You will also generate a table of contents with collapsable sections for the rewritten content.
The table of contents should link to the appropriate sections within the rewritten content.

Title: {{{title}}}
Image URL: {{{imageUrl}}}
Content: {{{content}}}

Rewrite the content and include a table of contents:
`,
});

const rewriteBlogContentFlow = ai.defineFlow(
  {
    name: 'rewriteBlogContentFlow',
    inputSchema: RewriteBlogContentInputSchema,
    outputSchema: RewriteBlogContentOutputSchema,
  },
  async input => {
    const {output} = await rewriteBlogContentPrompt(input);
    return output!;
  }
);
