'use server';

import { rewriteBlogContent } from '@/ai/flows/rewrite-blog-content';
import { generateImage } from '@/ai/flows/generate-image';
import { z } from 'zod';
import { RewriteFormSchema } from '@/lib/schemas';

type FormData = z.infer<typeof RewriteFormSchema>;

export async function generateTextContent(data: FormData) {
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
      rewrittenContent: rewriteResult.rewrittenContent,
      applyLink: validatedData.applyLink,
    };
  } catch (error) {
    console.error('Error in generateTextContent:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while processing your request.');
  }
}

export async function generateHeaderImage(data: FormData) {
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
            throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred while generating the image.');
    }
}