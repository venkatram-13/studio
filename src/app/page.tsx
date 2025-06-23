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

type FormData = z.infer<typeof RewriteFormSchema>;

type PartialResult = {
  executiveSummary: string | null;
  rewrittenContent: string | null;
  applyLink: string | null;
  generatedImage: string | null;
  source: 'scraped' | 'generated' | null;
};

export default function Home() {
  const [result, setResult] = useState<PartialResult | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<FormData | null>(
    null
  );
  const { toast } = useToast();

  const handleTextGeneration = async (data: FormData) => {
    setIsContentLoading(true);
    try {
      const response = await generateTextContent(data);
      setResult((prev) => ({
        ...prev,
        executiveSummary: response.executiveSummary,
        rewrittenContent: response.rewrittenContent,
        applyLink: response.applyLink,
        source: response.source,
      }));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating content',
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleImageGeneration = async (data: FormData) => {
    setIsImageLoading(true);
    try {
      const response = await generateHeaderImage(data);
      setResult((prev) => ({
        ...prev,
        generatedImage: response.generatedImage,
      }));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating image',
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    setLastSubmittedData(data);
    setResult(null);

    if (window.innerWidth < 1024) {
      document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    await Promise.allSettled([
      handleTextGeneration(data),
      handleImageGeneration(data),
    ]);
  };

  const handleRegenerateContent = () => {
    if (lastSubmittedData) {
      handleTextGeneration(lastSubmittedData);
    }
  };

  const handleRegenerateImage = () => {
    if (lastSubmittedData) {
      handleImageGeneration(lastSubmittedData);
    }
  };

  const isLoading = isContentLoading || isImageLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="shrink-0 border-b bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <WandSparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground font-headline">
                  ContentForge
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered content rewriting and enhancement.
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 h-full py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="lg:sticky lg:top-28">
              <ContentForgeForm
                onSubmit={handleFormSubmit}
                isPending={isLoading}
              />
            </div>
            <div id="preview-section">
              <ContentPreview
                result={result}
                isContentLoading={isContentLoading}
                isImageLoading={isImageLoading}
                onRegenerateContent={handleRegenerateContent}
                onRegenerateImage={handleRegenerateImage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
