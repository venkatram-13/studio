'use client';

import { useState } from 'react';
import { z } from 'zod';
import { ContentForgeForm } from '@/components/content-forge-form';
import { ContentPreview } from '@/components/content-preview';
import { handleRewriteContent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { WandSparkles } from 'lucide-react';
import { RewriteFormSchema } from '@/lib/schemas';

type RewriteResult = {
  rewrittenContent: string;
  applyLink: string;
} | null;

export default function Home() {
  const [result, setResult] = useState<RewriteResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: z.infer<typeof RewriteFormSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await handleRewriteContent(data);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <WandSparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground font-headline">ContentForge</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 h-full py-6">
          <div className="grid lg:grid-cols-2 gap-8 h-full items-start">
            <div className="h-full overflow-y-auto rounded-lg">
              <ContentForgeForm onSubmit={handleFormSubmit} isPending={isLoading} />
            </div>
            <div className="h-full overflow-y-auto rounded-lg">
              <ContentPreview result={result} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
