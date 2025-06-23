'use server';

/**
 * @fileOverview Rewrites job postings to attract top talent.
 *
 * - rewriteBlogContent - A function that rewrites job posting content.
 * - RewriteBlogContentInput - The input type for the rewriteBlogContent function.
 * - RewriteBlogContentOutput - The return type for the rewriteBlogContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { scrapeUrlContent } from '@/ai/tools/url-scraper';

const RewriteBlogContentInputSchema = z.object({
  title: z.string().describe('The job title.'),
  content: z.string().optional().describe('The job posting content to rewrite. Use this if raw text is provided.'),
  url: z.string().url().optional().describe('A URL to a job posting. Use this to scrape content first.'),
  applyLink: z.string().describe('The link for users to apply.'),
});
export type RewriteBlogContentInput = z.infer<typeof RewriteBlogContentInputSchema>;

const PromptInputSchema = z.object({
  title: z.string().describe('The job title.'),
  content: z.string().describe('The full job posting content to be rewritten.'),
});

const PromptOutputSchema = z.object({
  rewrittenContent: z.string().describe('The rewritten job posting with a table of contents.'),
});

const RewriteBlogContentOutputSchema = z.object({
  rewrittenContent: z.string().describe('The rewritten job posting with a table of contents.'),
});
export type RewriteBlogContentOutput = z.infer<typeof RewriteBlogContentOutputSchema>;

export async function rewriteBlogContent(input: RewriteBlogContentInput): Promise<RewriteBlogContentOutput> {
  return rewriteBlogContentFlow(input);
}

const rewriteBlogContentPrompt = ai.definePrompt({
  name: 'rewriteBlogContentPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an expert recruitment copywriter and employer branding specialist, renowned for crafting job descriptions that attract and engage top-tier candidates.

Your mission is to rewrite the provided job posting content, transforming it from a simple list of duties into a compelling career opportunity.

**Source Content to Rewrite:**

{{{content}}}

**Rewrite based on Core Directives:**

*   **Clarity & Flow:** Rewrite the content to be exceptionally clear, logical, and easy for a potential candidate to follow. Structure the content logically, perhaps with sections like "About Us," "The Role," "Your Responsibilities," "What You'll Bring," and "Why You'll Love Working Here."
*   **Tone & Style:** The tone must be professional, yet warm, engaging, and inclusive. Use an active voice and speak directly to the candidate (e.g., "You will..." instead of "The successful candidate will..."). Avoid corporate jargon and clichés. The goal is to make the company and role sound exciting and appealing.
*   **Value Proposition:** Don't just list requirements. Sell the opportunity. Highlight the company culture, growth opportunities, impactful projects, and key benefits. Frame the role in terms of what the candidate will achieve and learn.

**Apply Structural Requirements (Strictly follow):**

*   **Table of Contents (TOC):**
    *   Generate a markdown-formatted, collapsible TOC using HTML \`<details>\` and \`<summary>Table of Contents</summary>\` tags. This will help candidates navigate the job description.
    *   Each TOC item must be a markdown link pointing to a corresponding section anchor (e.g., \`[About Us](#about-us)\`).
*   **Headings & Anchors:**
    *   The rewritten content must be structured with H2 and H3 markdown headings.
    *   Crucially, every heading must have an HTML anchor tag with an ID that matches its TOC link. The ID must be lowercase with hyphens for spaces.
    *   **Example:** A section titled "About Us" should be formatted as \`## <a id="about-us"></a>About Us\`.

**Reference Information:**

*   **Job Title:** \`{{{title}}}\`

**Final Output Format:**

Produce a single markdown string. This string must begin with the complete collapsible HTML table of contents, immediately followed by the full, rewritten job posting with the correctly formatted and anchored headings. Do not include the title in the output itself.
`,
});

const rewriteBlogContentFlow = ai.defineFlow(
  {
    name: 'rewriteBlogContentFlow',
    inputSchema: RewriteBlogContentInputSchema,
    outputSchema: RewriteBlogContentOutputSchema,
  },
  async (input) => {
    let contentToRewrite = input.content;

    if (input.url) {
      contentToRewrite = await scrapeUrlContent(input.url);
    }

    if (!contentToRewrite) {
      throw new Error('No content available to rewrite. Please provide either text or a valid URL with scrapable content.');
    }
    
    const {output} = await rewriteBlogContentPrompt({
      title: input.title,
      content: contentToRewrite,
    });

    return {
      rewrittenContent: output!.rewrittenContent,
    };
  }
);
