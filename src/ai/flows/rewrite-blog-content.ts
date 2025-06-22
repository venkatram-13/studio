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

const PromptOutputSchema = z.object({
  rewrittenContent: z.string().describe('The rewritten blog content with a table of contents.'),
});

const RewriteBlogContentOutputSchema = z.object({
  rewrittenContent: z.string().describe('The rewritten blog content with a table of contents.'),
  imageUrl: z.string().optional(),
});
export type RewriteBlogContentOutput = z.infer<typeof RewriteBlogContentOutputSchema>;

export async function rewriteBlogContent(input: RewriteBlogContentInput): Promise<RewriteBlogContentOutput> {
  return rewriteBlogContentFlow(input);
}

const rewriteBlogContentPrompt = ai.definePrompt({
  name: 'rewriteBlogContentPrompt',
  input: {schema: RewriteBlogContentInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an expert blog content writer. Your task is to rewrite the provided blog content to enhance readability and engagement.

**Instructions:**

1.  **Table of Contents:**
    *   Generate a markdown-formatted table of contents for the rewritten blog post.
    *   Use markdown links (e.g., \`[Section 1](#section-1)\`) for each item.
    *   Make the Table of Contents collapsible by wrapping it in HTML \`<details>\` and \`<summary>Table of Contents</summary>\` tags.

2.  **Rewritten Content:**
    *   Rewrite the original content provided in the input.
    *   Improve clarity, flow, and engagement.
    *   Ensure the headings in the rewritten content have corresponding HTML anchors that match the links in the table of contents. For example, a heading for "Section 1" should be written as \`## <a id="section-1"></a>Section 1\`. The ID should be lowercase and use hyphens for spaces.

**Input:**

*   **Title:** \`{{{title}}}\`
*   **Original Content/URL:** \`{{{content}}}\`

**Output:**

Provide a single markdown string that contains the collapsible table of contents, followed by the full rewritten blog post with linked headings. Do not include the title in your output.
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
    return {
      rewrittenContent: output!.rewrittenContent,
      imageUrl: input.imageUrl,
    };
  }
);
