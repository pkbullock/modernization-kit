import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://pkbullock.github.io/modernization-kit',
  base: '/modernization-kit',
  integrations: [mdx(), icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});
