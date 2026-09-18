import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://pkbullock.github.io/modernization-kit',
  vite: {
    plugins: [tailwindcss()]
  }
});
