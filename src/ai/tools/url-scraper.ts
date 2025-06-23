'use server';
/**
 * @fileOverview A Genkit tool for scraping text content from a URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as cheerio from 'cheerio';

async function scrapeUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText} (Status: ${response.status})`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove common non-content elements to clean up the output
    $('script, style, nav, footer, header, aside, .ad, .advert, .comment, .comments, .sidebar, .footer, .header, .nav, #ad, #advert, #comment, #comments, #sidebar, #footer, #header, #nav').remove();
    
    let mainContent = $('article, main, .main, .post, .entry-content, #main, #content').first();

    if (mainContent.length === 0) {
      mainContent = $('body');
    }

    const content = mainContent.find('h1, h2, h3, h4, p').map((i, el) => $(el).text().trim()).get().join('\n\n');
    
    if (!content) {
      throw new Error("Could not extract any meaningful content from the URL. The page might be empty or require JavaScript to render.");
    }
    
    return content;
  } catch (error) {
    console.error('Error scraping URL:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to scrape content from the URL. Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while scraping the URL.');
  }
}

export const urlScraperTool = ai.defineTool(
  {
    name: 'urlScraperTool',
    description: 'Fetches and extracts the main textual content from a given blog post URL.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the blog post to scrape.'),
    }),
    outputSchema: z.string().describe('The scraped text content of the article.'),
  },
  async ({ url }) => {
    try {
      return await scrapeUrlContent(url);
    } catch (error) {
      if (error instanceof Error) {
        return `Scraping failed: ${error.message}`;
      }
      return 'Scraping failed with an unknown error.';
    }
  }
);

export { scrapeUrlContent };
