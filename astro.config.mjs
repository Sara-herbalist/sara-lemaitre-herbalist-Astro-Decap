import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.saralemaitre.com',
  output: 'static',
  build: {
    format: 'file'
  }
});
