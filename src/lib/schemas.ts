import { z } from 'zod';

export const RewriteFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content or URL is required.'),
  applyLink: z.string().url('Please enter a valid "Apply Now" link URL.'),
});
