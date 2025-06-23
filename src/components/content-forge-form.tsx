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
import { Rocket, FileText, Link as LinkIcon, Heading1 } from 'lucide-react';
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
      applyLink: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content to Rewrite</CardTitle>
        <CardDescription>
          Enter the post details below. The AI will rewrite the content and generate a table of contents.
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

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content or Blog URL</FormLabel>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Textarea
                        placeholder="Paste your blog content or a URL to the post..."
                        className="min-h-[200px] pl-9"
                        {...field}
                      />
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
              {isPending ? 'Rewriting Content...' : 'Rewrite Content'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
