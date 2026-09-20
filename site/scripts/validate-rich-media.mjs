import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readBuildFile = async (relativePath) => {
  const fileUrl = new URL(`../dist/${relativePath}`, import.meta.url);
  return readFile(fileUrl, 'utf8');
};

const placeholderHtml = await readBuildFile('identify/placeholder/index.html');

const mermaidMatches = placeholderHtml.match(/data-language="mermaid"/g) ?? [];
assert.ok(
  mermaidMatches.length >= 2,
  'Expected both canonical Mermaid and legacy marmaid examples to build as Mermaid code blocks.'
);

assert.ok(
  !placeholderHtml.includes('data-language="plaintext"'),
  'Expected Mermaid examples to avoid plaintext syntax highlighting fallback.'
);
assert.match(
  placeholderHtml,
  /Discover classic pages[\s\S]*Identify page owners/,
  'Expected the canonical Mermaid example content to be present in the built HTML.'
);
assert.match(
  placeholderHtml,
  /Inventory classic pages[\s\S]*Identify page owners/,
  'Expected the legacy marmaid compatibility example content to be present in the built HTML.'
);

console.log('Rich media validation passed.');
