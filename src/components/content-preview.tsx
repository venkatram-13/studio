'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Sparkles, ExternalLink, Clipboard, Check, Download, Info, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ContentPreviewProps = {
  result: {
    executiveSummary: string | null;
    rewrittenContent: string | null;
    applyLink: string | null;
    generatedImage: string | null;
    source: 'scraped' | 'generated' | null;
  } | null;
  isContentLoading: boolean;
  isImageLoading: boolean;
  onRegenerateContent: () => void;
  onRegenerateImage: () => void;
};

const TextContentSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <div className="space-y-2 pt-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

const Placeholder = () => (
  <Card className="flex h-full items-center justify-center border-dashed border-2 bg-transparent shadow-none min-h-[300px] md:min-h-[500px]">
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
      </div>
      <h3 className="text-xl md:text-2xl font-semibold font-headline">Content Appears Here</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Once you submit your content, the rewritten version and generated image will be displayed here.
      </p>
    </div>
  </Card>
);


export function ContentPreview({ result, isContentLoading, isImageLoading, onRegenerateContent, onRegenerateImage }: ContentPreviewProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isLoading = isContentLoading || isImageLoading;

  if (!isLoading && !result) {
    return <Placeholder />;
  }

  const handleCopy = () => {
    if (result?.rewrittenContent || result?.executiveSummary) {
      const fullContent = result.executiveSummary
        ? `${result.executiveSummary}\n\n---\n\n${result.rewrittenContent || ''}`
        : result.rewrittenContent || '';

      navigator.clipboard.writeText(fullContent).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      });
    }
  };

  const sourceText = result?.source === 'scraped' 
    ? 'Content was rewritten based on the provided text/URL.' 
    : 'Content was generated from scratch based on the title.';

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription className="mt-1.5">
              Here is the AI-generated version of your content and image.
            </CardDescription>
          </div>
          {result?.rewrittenContent && !isContentLoading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRegenerateContent}
              disabled={isContentLoading}
              title="Regenerate Content"
              className="h-8 w-8 shrink-0"
            >
              <RefreshCw className={cn('h-4 w-4', isContentLoading && 'animate-spin')} />
            </Button>
          )}
        </div>
        {result?.source && !isContentLoading && (
          <Alert className="mt-4 text-sm">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {sourceText}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <Tabs defaultValue="preview" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">
              <Sparkles className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="markdown">
              <Code className="w-4 h-4 mr-2" />
              Markdown
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 mt-4">
            <TabsContent value="preview">
              {isImageLoading ? (
                 <Skeleton className="w-full aspect-video rounded-lg mb-6 shadow-lg" />
              ) : (
                result?.generatedImage && (
                  <div className="relative group mb-6 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={result.generatedImage}
                      alt="AI Generated Image"
                      className="w-full h-auto"
                      data-ai-hint="blog image"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        asChild
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9"
                      >
                        <a href={result.generatedImage} download="generated-header-image.png">
                          <Download className="h-5 w-5" />
                          <span className="sr-only">Download Image</span>
                        </a>
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9"
                        onClick={onRegenerateImage}
                        disabled={isImageLoading}
                        title="Regenerate Image"
                      >
                        <RefreshCw className={cn('h-5 w-5', isImageLoading && 'animate-spin')} />
                        <span className="sr-only">Regenerate Image</span>
                      </Button>
                    </div>
                  </div>
                )
              )}
              {isContentLoading ? (
                <TextContentSkeleton />
              ) : (
                <>
                  {result?.executiveSummary && (
                    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-base italic text-foreground/80">
                      <p>{result.executiveSummary}</p>
                    </div>
                  )}
                  {result?.rewrittenContent && (
                    <div className="markdown-preview">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {result.rewrittenContent}
                      </ReactMarkdown>
                    </div>
                  )}
                  {result?.applyLink && (
                    <div className="mt-8 text-center">
                      <Button asChild size="lg">
                        <a href={result.applyLink} target="_blank" rel="noopener noreferrer">
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            <TabsContent value="markdown">
              <div className="bg-muted p-4 rounded-md relative">
                 {isContentLoading ? (
                  <TextContentSkeleton />
                ) : (
                   (result?.rewrittenContent || result?.executiveSummary) && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleCopy}
                        title={isCopied ? 'Copied!' : 'Copy markdown'}
                      >
                        <span className="sr-only">Copy Markdown</span>
                        {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
                      </Button>
                      <pre className="text-sm font-code whitespace-pre-wrap break-words">
                        <code>
                          {result.executiveSummary ? `${result.executiveSummary}\n\n---\n\n` : ''}
                          {result.rewrittenContent}
                        </code>
                      </pre>
                    </>
                   )
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
