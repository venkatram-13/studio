'use server';

import { rewriteBlogContent } from '@/ai/flows/rewrite-blog-content';
import { generateImage } from '@/ai/flows/generate-image';
import { z } from 'zod';
import { RewriteFormSchema } from '@/lib/schemas';

type FormData = z.infer<typeof RewriteFormSchema>;

type TextContentResult = {
  executiveSummary: string;
  rewrittenContent: string;
  applyLink: string;
  source: 'scraped' | 'generated';
  error?: undefined;
} | { error: string };

type ImageContentResult = {
  generatedImage: string | null;
  error?: undefined;
} | { error: string };


export async function generateTextContent(data: FormData): Promise<TextContentResult> {
  try {
    const validatedData = RewriteFormSchema.parse(data);

    const rewriteResult = await rewriteBlogContent({
      title: validatedData.title,
      content: validatedData.content,
      url: validatedData.url,
      applyLink: validatedData.applyLink,
    });

    if (!rewriteResult || !rewriteResult.rewrittenContent) {
      throw new Error('AI failed to generate content.');
    }

    return {
      executiveSummary: rewriteResult.executiveSummary,
      rewrittenContent: rewriteResult.rewrittenContent,
      applyLink: validatedData.applyLink,
      source: rewriteResult.source,
    };
  } catch (error) {
    console.error('Error in generateTextContent:', error);
    if (error instanceof z.ZodError) {
      return { error: `Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while processing your request.' };
  }
}

export async function generateHeaderImage(data: FormData): Promise<ImageContentResult> {
    try {
        const validatedData = RewriteFormSchema.parse(data);
        
        if (validatedData.imageUrl) {
            return { generatedImage: validatedData.imageUrl };
        }
        
        if (validatedData.imagePrompt) {
            const generatedImage = await generateImage(validatedData.imagePrompt);
            return { generatedImage };
        }

        return { generatedImage: null };

    } catch (error) {
        console.error('Error in generateHeaderImage:', error);
        if (error instanceof z.ZodError) {
             return { error: `Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` };
        }
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'An unexpected error occurred while generating the image.' };
    }
}
