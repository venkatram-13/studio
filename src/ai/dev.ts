import { config } from 'dotenv';
config();

import '@/ai/flows/generate-table-of-contents.ts';
import '@/ai/flows/rewrite-blog-content.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/tools/url-scraper.ts';
