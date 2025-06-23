import { z } from 'zod';

export const RewriteFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().optional(),
  url: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  applyLink: z.string().url('Please enter a valid "Apply Now" link URL.'),
}).refine(data => !!data.content !== !!data.url, {
    message: "Please provide either text content or a URL, but not both.",
    path: ["content"],
});
