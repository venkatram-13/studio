'use server';

import { rewriteBlogContent } from '@/ai/flows/rewrite-blog-content';
import { generateImage } from '@/ai/flows/generate-image';
import { z } from 'zod';
import { RewriteFormSchema } from '@/lib/schemas';

type FormData = z.infer<typeof RewriteFormSchema>;

export async function handleRewriteContent(data: FormData) {
  try {
    const validatedData = RewriteFormSchema.parse(data);

    let imagePromise: Promise<string | null>;

    if (validatedData.imageUrl) {
      imagePromise = Promise.resolve(validatedData.imageUrl);
    } else if (validatedData.imagePrompt) {
      imagePromise = generateImage(validatedData.imagePrompt);
    } else {
      imagePromise = Promise.resolve(null);
    }

    const rewritePromise = rewriteBlogContent({
      title: validatedData.title,
      content: validatedData.content,
      url: validatedData.url,
      applyLink: validatedData.applyLink,
    });

    const [rewriteResult, generatedImage] = await Promise.all([rewritePromise, imagePromise]);

    if (!rewriteResult || !rewriteResult.rewrittenContent) {
      throw new Error('AI failed to generate content.');
    }

    return {
      rewrittenContent: rewriteResult.rewrittenContent,
      applyLink: validatedData.applyLink,
      generatedImage: generatedImage,
    };
  } catch (error) {
    console.error('Error in handleRewriteContent:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw new Error('An unexpected error occurred while processing your request.');
  }
}
