import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://pkbullock.github.io/modernization-kit',
  base: '/modernization-kit',
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});
