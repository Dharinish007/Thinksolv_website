import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    order: z.number().default(99),
    category: z.enum(['Document Conversion', 'Docs Automation', 'Workspace']),
    platform: z.enum(['Chrome Extension', 'Google Workspace Add-on']),
    tagline: z.string(),
    summary: z.string(),
    icon: z.string().default('doc'),
    featured: z.boolean().default(false),
    // Product detail content
    problem: z.string(),
    solution: z.string(),
    howItWorks: z.array(z.object({ title: z.string(), body: z.string() })),
    features: z.array(z.object({ title: z.string(), body: z.string() })),
    outcomes: z.array(z.string()),
    // Metrics are unverified per-product — keep optional, mark CONFIRM in UI.
    rating: z.number().optional(), // CONFIRM
    users: z.string().optional(), // CONFIRM
    storeUrl: z.string().optional(), // CONFIRM
    needsConfirm: z.boolean().default(true),
  }),
});

export const collections = { products };
