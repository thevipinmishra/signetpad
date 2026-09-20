import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react(), mdx()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
