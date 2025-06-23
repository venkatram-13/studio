'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, FileText, Link as LinkIcon, Heading1, Link2, CaseSensitive, Image, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RewriteFormSchema } from '@/lib/schemas';

type ContentForgeFormProps = {
  onSubmit: (values: z.infer<typeof RewriteFormSchema>) => void;
  isPending: boolean;
};

export function ContentForgeForm({ onSubmit, isPending }: ContentForgeFormProps) {
  const form = useForm<z.infer<typeof RewriteFormSchema>>({
    resolver: zodResolver(RewriteFormSchema),
    defaultValues: {
      title: '',
      content: '',
      url: '',
      applyLink: '',
      imageUrl: '',
      imagePrompt: '',
    },
  });

  const onContentTabsChange = (value: string) => {
    if (value === 'url') {
      form.setValue('content', '');
    } else {
      form.setValue('url', '');
    }
    form.clearErrors(['content', 'url']);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content to Rewrite</CardTitle>
        <CardDescription>
          Enter the post details below. Provide a URL to scrape or paste the content directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                   <div className="relative">
                    <Heading1 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., The Future of Web Development" className="pl-9" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="url" className="w-full" onValueChange={onContentTabsChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4" /> From URL</TabsTrigger>
                <TabsTrigger value="text"><CaseSensitive className="mr-2 h-4 w-4" /> Paste Text</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Post URL</FormLabel>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="https://example.com/blog/my-post" className="pl-9" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>The AI will fetch and rewrite the content from this link.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="text" className="pt-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Textarea
                            placeholder="Paste your blog content here..."
                            className="min-h-[200px] pl-9"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Paste the raw text you want to rewrite.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Image URL (Optional)</FormLabel>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="https://example.com/image.png" className="pl-9" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative flex justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="imagePrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Generate Header Image (Optional)</FormLabel>
                  <div className="relative">
                    <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., A futuristic cityscape at dusk" className="pl-9" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applyLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apply Now Link</FormLabel>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="https://example.com/apply" className="pl-9" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              <Rocket className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
              {isPending ? 'Generating...' : 'Generate Content'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
