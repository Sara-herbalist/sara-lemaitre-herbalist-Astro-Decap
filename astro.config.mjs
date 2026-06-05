import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://www.saralemaitre.com',import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://www.saralemaitre.com',
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'ignore'
});

  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'ignore'
});
