'use server';

/**
 * @fileOverview Rewrites blog content to improve readability and engagement.
 *
 * - rewriteBlogContent - A function that rewrites blog content.
 * - RewriteBlogContentInput - The input type for the rewriteBlogContent function.
 * - RewriteBlogContentOutput - The return type for the rewriteBlogContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { urlScraperTool } from '@/ai/tools/url-scraper';

const RewriteBlogContentInputSchema = z.object({
  title: z.string().describe('The title of the blog.'),
  content: z.string().optional().describe('The blog content to rewrite. Use this if raw text is provided.'),
  url: z.string().url().optional().describe('A URL to a blog post. Use this to scrape content first.'),
  applyLink: z.string().describe('The link for users to apply.'),
});
export type RewriteBlogContentInput = z.infer<typeof RewriteBlogContentInputSchema>;

const PromptOutputSchema = z.object({
  rewrittenContent: z.string().describe('The rewritten blog content with a table of contents.'),
});

const RewriteBlogContentOutputSchema = z.object({
  rewrittenContent: z.string().describe('The rewritten blog content with a table of contents.'),
});
export type RewriteBlogContentOutput = z.infer<typeof RewriteBlogContentOutputSchema>;

export async function rewriteBlogContent(input: RewriteBlogContentInput): Promise<RewriteBlogContentOutput> {
  return rewriteBlogContentFlow(input);
}

const rewriteBlogContentPrompt = ai.definePrompt({
  name: 'rewriteBlogContentPrompt',
  tools: [urlScraperTool],
  input: {schema: RewriteBlogContentInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an elite content strategist and SEO expert, renowned for transforming dry or complex topics into compelling, insightful, and highly engaging blog posts.

Your mission is to rewrite the provided blog content, elevating it to a professional standard.

**Execution Steps:**

1.  **Determine Content Source:**
    *   If the \`url\` field is provided, you **must** use the \`urlScraperTool\` to fetch the content from that URL. Use the returned text as the source for rewriting.
    *   If the \`content\` field is provided, use that text directly as the source.

2.  **Rewrite based on Core Directives:**
    *   **Clarity & Flow:** Rewrite the content to be exceptionally clear, logical, and easy to follow. Ensure smooth transitions between ideas and sections.
    *   **Engagement:** Adopt a professional yet approachable tone. Use storytelling, relevant examples, and rhetorical questions to captivate the reader.
    *   **Value Addition:** Do not just rephrase. Enrich the original text by adding valuable insights, fresh perspectives, or clarifying complex points.
    *   **Length:** The target length for the rewritten post is approximately 800 words. Prioritize quality, depth, and impact over meeting a strict word count.

3.  **Apply Structural Requirements (Strictly follow):**
    *   **Table of Contents (TOC):**
        *   Generate a markdown-formatted, collapsible TOC using HTML \`<details>\` and \`<summary>Table of Contents</summary>\` tags.
        *   Each TOC item must be a markdown link pointing to a corresponding section anchor (e.g., \`[Section Title](#section-title)\`).
    *   **Headings & Anchors:**
        *   The rewritten content must be structured with H2 and H3 markdown headings.
        *   Crucially, every heading must have an HTML anchor tag with an ID that matches its TOC link. The ID must be lowercase with hyphens for spaces.
        *   **Example:** A section titled "Our Core Mission" should be formatted as \`## <a id="our-core-mission"></a>Our Core Mission\`.

**Input Data:**

*   **Title:** \`{{{title}}}\`
*   **Original Content URL (optional):** \`{{{url}}}\`
*   **Original Content Text (optional):** \`{{{content}}}\`

**Final Output Format:**

Produce a single markdown string. This string must begin with the complete collapsible HTML table of contents, immediately followed by the full, rewritten blog post with the correctly formatted and anchored headings. Do not include the title in the output itself.
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
    };
  }
);
