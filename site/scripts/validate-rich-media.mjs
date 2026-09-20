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

const scriptMatch = placeholderHtml.match(/<script type="module" src="\/modernization-kit\/([^"]*BaseLayout[^"]+\.js)"/);
assert.ok(scriptMatch, 'Expected the placeholder page to reference the BaseLayout client bundle.');

const layoutBundle = await readBuildFile(scriptMatch[1]);
assert.match(layoutBundle, /mermaid\.core/, 'Expected the emitted layout bundle to include Mermaid runtime loading logic.');
assert.match(layoutBundle, /dataset\.renderedTheme/, 'Expected the emitted layout bundle to track rendered Mermaid themes.');
assert.match(layoutBundle, /marmaid/, 'Expected the emitted layout bundle to preserve legacy marmaid compatibility.');

console.log('Rich media validation passed.');
