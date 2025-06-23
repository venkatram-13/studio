'use server';

import { rewriteBlogContent } from '@/ai/flows/rewrite-blog-content';
import { generateImage } from '@/ai/flows/generate-image';
import { z } from 'zod';
import { RewriteFormSchema } from '@/lib/schemas';

type FormData = z.infer<typeof RewriteFormSchema>;

export async function handleRewriteContent(data: FormData) {
  try {
    const validatedData = RewriteFormSchema.parse(data);

    // If an image URL is provided, use it. Otherwise, generate an image from the prompt.
    const imagePromise: Promise<string | null> = validatedData.imageUrl
      ? Promise.resolve(validatedData.imageUrl)
      : generateImage(validatedData.imagePrompt);

    const [rewriteResult, imageResult] = await Promise.all([
      rewriteBlogContent({
        title: validatedData.title,
        content: validatedData.content,
        applyLink: validatedData.applyLink,
      }),
      imagePromise
    ]);


    if (!rewriteResult || !rewriteResult.rewrittenContent) {
      throw new Error('AI failed to generate content.');
    }

    return {
      rewrittenContent: rewriteResult.rewrittenContent,
      applyLink: validatedData.applyLink,
      generatedImage: imageResult,
    };
  } catch (error) {
    console.error('Error in handleRewriteContent:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('An unexpected error occurred while processing your request.');
  }
}
