'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Code, Sparkles, ExternalLink } from 'lucide-react';

type ContentPreviewProps = {
  result: {
    rewrittenContent: string;
    applyLink: string;
    imageUrl?: string;
  } | null;
  isLoading: boolean;
};

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-7 w-3/5" />
      <Skeleton className="h-4 w-4/5 mt-2" />
    </CardHeader>
    <CardContent className="space-y-4">
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
      <div className="space-y-2 pt-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </CardContent>
  </Card>
);

const Placeholder = () => (
  <Card className="flex h-full items-center justify-center">
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-8 border-primary/20">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold font-headline">Your rewritten content will appear here</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Fill out the form and let our AI work its magic. The result will be shown in markdown and a rendered preview.
      </p>
    </div>
  </Card>
);

export function ContentPreview({ result, isLoading }: ContentPreviewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!result?.rewrittenContent) {
    return <Placeholder />;
  }

  const fullMarkdown = result.imageUrl
    ? `![Blog Post Image](${result.imageUrl})\n\n${result.rewrittenContent}`
    : result.rewrittenContent;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
        <CardDescription>
          Here is the AI-rewritten version of your content.
        </CardDescription>
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
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <TabsContent value="preview">
              <div className="markdown-preview">
                {result.imageUrl && (
                  <div className="relative w-full aspect-video mb-6">
                    <Image
                      src={result.imageUrl}
                      alt="Blog post image"
                      fill
                      className="rounded-lg object-cover"
                      data-ai-hint="blog post"
                    />
                  </div>
                )}
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {result.rewrittenContent}
                </ReactMarkdown>
              </div>
              <div className="mt-8 text-center">
                <Button asChild size="lg">
                  <a href={result.applyLink} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="markdown">
              <div className="bg-muted p-4 rounded-md relative">
                <pre className="text-sm font-code whitespace-pre-wrap break-words">
                  <code>{fullMarkdown}</code>
                </pre>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
