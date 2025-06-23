'use client';

import { useState } from 'react';
import { z } from 'zod';
import { ContentForgeForm } from '@/components/content-forge-form';
import { ContentPreview } from '@/components/content-preview';
import { generateTextContent, generateHeaderImage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { WandSparkles } from 'lucide-react';
import { RewriteFormSchema } from '@/lib/schemas';
import { ThemeToggle } from '@/components/theme-toggle';

type PartialResult = {
  rewrittenContent: string | null;
  applyLink: string | null;
  generatedImage: string | null;
  source: 'scraped' | 'generated' | null;
};

export default function Home() {
  const [result, setResult] = useState<PartialResult | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: z.infer<typeof RewriteFormSchema>) => {
    setResult(null);
    setIsContentLoading(true);
    setIsImageLoading(true);

    const textPromise = generateTextContent(data)
      .then((response) => {
        setResult((prev) => ({
          ...prev,
          rewrittenContent: response.rewrittenContent,
          applyLink: response.applyLink,
          source: response.source,
        }));
      })
      .catch((error) => {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error generating content',
          description:
            error instanceof Error ? error.message : 'Please try again.',
        });
      })
      .finally(() => {
        setIsContentLoading(false);
      });

    const imagePromise = generateHeaderImage(data)
      .then((response) => {
        setResult((prev) => ({
          ...prev,
          generatedImage: response.generatedImage,
        }));
      })
      .catch((error) => {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error generating image',
          description:
            error instanceof Error ? error.message : 'Please try again.',
        });
      })
      .finally(() => {
        setIsImageLoading(false);
      });

    await Promise.allSettled([textPromise, imagePromise]);
  };

  const isLoading = isContentLoading || isImageLoading;

  return (
    <div className="flex flex-col h-screen">
      <header className="shrink-0 border-b bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <WandSparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-headline">ContentForge</h1>
                <p className="text-sm text-muted-foreground">AI-powered content rewriting and enhancement.</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 h-full py-8">
          <div className="grid lg:grid-cols-2 gap-8 h-full items-start">
            <div className="h-full overflow-y-auto rounded-lg pr-4">
              <ContentForgeForm onSubmit={handleFormSubmit} isPending={isLoading} />
            </div>
            <div className="h-full overflow-y-auto rounded-lg pr-4">
              <ContentPreview
                result={result}
                isContentLoading={isContentLoading}
                isImageLoading={isImageLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
