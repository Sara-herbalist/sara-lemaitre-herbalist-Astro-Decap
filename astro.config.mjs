import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.saralemaitre.com',
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  integrations: [sitemap()]
});
