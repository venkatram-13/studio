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
  content: z.string().optional().describe('The job posting content to be rewritten. This may be empty if scraping failed.'),
  url: z.string().url().optional().describe('The URL of the job posting, for context.'),
});

const PromptOutputSchema = z.object({
  executiveSummary: z.string().describe('A concise, one-paragraph executive summary of the job posting, written in a professional and engaging tone.'),
  rewrittenContent: z.string().describe('The rewritten job posting with a table of contents.'),
});

const RewriteBlogContentOutputSchema = z.object({
  executiveSummary: z.string().describe('A concise, one-paragraph executive summary of the job posting.'),
  rewrittenContent: z.string().describe('The rewritten job posting with a table of contents.'),
  source: z.enum(['scraped', 'generated']).describe('Indicates if the content was based on a scraped URL/pasted text, or generated from scratch.'),
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

Your mission is to rewrite the provided job posting content, or if no content is provided, create a compelling job posting based on the title and URL.

**Source Information:**
*   **Job Title:** \`{{{title}}}\`
*   **Original URL (for context):** \`{{{url}}}\`
*   **Scraped Content (may be empty):**
    {{{content}}}

**Execution Plan:**

1.  **Analyze Source:**
    *   **If Scraped Content is provided:** Use this as your primary source. Your task is to rewrite and enhance it.
    *   **If Scraped Content is EMPTY:** Your task is to generate a new, high-quality job posting from scratch. Use the Job Title and the context you can infer from the URL to create a comprehensive and appealing description. Assume standard roles and responsibilities for the given job title.

2.  **Generate Executive Summary:**
    *   First, craft a compelling, one-paragraph executive summary (around 50-70 words) for the \`executiveSummary\` field. This summary should act as a hook, quickly communicating the role's value proposition and enticing the candidate to read further.

3.  **Rewrite/Generate Main Content:**
    *   **Clarity & Flow:** Rewrite the content to be exceptionally clear, logical, and easy for a potential candidate to follow. Structure it logically with sections like "About Us," "The Role," "Your Responsibilities," "What You'll Bring," and "Why You'll Love Working Here."
    *   **Tone & Style:** The tone must be professional, yet warm, engaging, and inclusive. Use an active voice and speak directly to the candidate (e.g., "You will..."). Avoid corporate jargon.
    *   **Value Proposition:** Don't just list requirements. Sell the opportunity. Highlight company culture, growth opportunities, and key benefits.

4.  **Format Main Content:**
    *   The main content must be a single markdown string for the \`rewrittenContent\` field.
    *   It **must** begin with a collapsible Table of Contents using HTML \`<details>\` and \`<summary>\` tags.
    *   All H2/H3 headings in the content must have corresponding HTML anchor tags with lowercase, hyphenated IDs (e.g., \`## <a id="about-us"></a>About Us\`).

Do not include the job title in the output content itself.
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
    let source: 'scraped' | 'generated' = 'generated';

    if (input.url) {
      try {
        contentToRewrite = await scrapeUrlContent(input.url);
        source = 'scraped';
      } catch (error) {
        console.warn(`URL scraping failed for "${input.url}". Falling back to AI generation. Error: ${error instanceof Error ? error.message : String(error)}`);
        // Set content to empty so the AI knows to generate from scratch
        contentToRewrite = '';
        source = 'generated';
      }
    } else if (input.content) {
      source = 'scraped'; // Treat pasted text as "scraped"
    }
    
    const {output} = await rewriteBlogContentPrompt({
      title: input.title,
      content: contentToRewrite,
      url: input.url,
    });

    if (!output?.rewrittenContent || !output?.executiveSummary) {
      throw new Error('AI failed to generate content.');
    }

    return {
      executiveSummary: output.executiveSummary,
      rewrittenContent: output.rewrittenContent,
      source,
    };
  }
);
