import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.thinksolv.com',
  output: 'static',
  prefetch: true,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  // Self-host the brand fonts at build time (no render-blocking third-party CSS,
  // metric-matched fallbacks). Weights match what the design actually uses.
  experimental: {
    fonts: [
      { provider: fontProviders.google(), name: 'Inter', cssVariable: '--ff-inter', weights: [400, 500, 600], subsets: ['latin'], fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'] },
      { provider: fontProviders.google(), name: 'Instrument Sans', cssVariable: '--ff-display', weights: [500, 600], subsets: ['latin'], fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'] },
      { provider: fontProviders.google(), name: 'JetBrains Mono', cssVariable: '--ff-mono', weights: [400, 500], subsets: ['latin'], fallbacks: ['ui-monospace', 'monospace'] },
    ],
  },
});
