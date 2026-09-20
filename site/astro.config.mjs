import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

const normalizeMarmaidCodeFences = () => (tree) => {
  const visit = (node) => {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (node.type === 'code' && typeof node.lang === 'string' && node.lang.toLowerCase() === 'marmaid') {
      node.lang = 'mermaid';
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(visit);
    }
  };

  visit(tree);
};

export default defineConfig({
  site: 'https://pkbullock.github.io/modernization-kit',
  base: '/modernization-kit',
  integrations: [mdx(), icon()],
  markdown: {
    processor: unified({
      remarkPlugins: [normalizeMarmaidCodeFences]
    })
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
