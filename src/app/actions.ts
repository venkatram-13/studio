'use server';

import { rewriteBlogContent } from '@/ai/flows/rewrite-blog-content';
import { z } from 'zod';
import { RewriteFormSchema } from '@/lib/schemas';

type FormData = z.infer<typeof RewriteFormSchema>;

export async function handleRewriteContent(data: FormData) {
  try {
    const validatedData = RewriteFormSchema.parse(data);

    const result = await rewriteBlogContent({
      ...validatedData,
      imageUrl: validatedData.imageUrl || '',
    });

    if (!result || !result.rewrittenContent) {
      throw new Error('AI failed to generate content.');
    }

    return {
      rewrittenContent: result.rewrittenContent,
      applyLink: validatedData.applyLink,
    };
  } catch (error) {
    console.error('Error in handleRewriteContent:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('An unexpected error occurred while rewriting content.');
  }
}
