import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { setupMermaidDiagrams } from '../src/scripts/mermaidDiagrams.js';

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

const flush = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const createRuntimeDom = (markup) => new JSDOM(markup, { url: 'https://example.test/' });

const runtimeDom = createRuntimeDom(`<!doctype html><html data-theme="light"><body><pre data-language="mermaid"><code>flowchart LR\n  Discover --> Plan</code></pre></body></html>`);
const runtimeCalls = { initialize: [], run: [] };
const mermaidStub = {
  initialize: (options) => runtimeCalls.initialize.push(options),
  run: async ({ nodes }) => {
    runtimeCalls.run.push(nodes.map((node) => node.dataset.source));
    nodes.forEach((node) => {
      node.innerHTML = '<svg aria-hidden="true"></svg>';
    });
  }
};

setupMermaidDiagrams({
  document: runtimeDom.window.document,
  window: runtimeDom.window,
  loadMermaid: async () => mermaidStub
});
runtimeDom.window.document.dispatchEvent(new runtimeDom.window.Event('DOMContentLoaded'));
await flush();

const renderedContainer = runtimeDom.window.document.querySelector('.mermaid');
const toolbarButtons = [...runtimeDom.window.document.querySelectorAll('.mermaid-toolbar .mermaid-control')];
assert.ok(renderedContainer, 'Expected Mermaid preformatted content to be replaced with a Mermaid container at runtime.');
assert.equal(renderedContainer?.dataset.renderedTheme, 'default', 'Expected the initial Mermaid render to record the active light theme.');
assert.match(renderedContainer?.innerHTML ?? '', /<svg/, 'Expected the runtime Mermaid renderer to populate SVG output.');
assert.equal(toolbarButtons.length, 4, 'Expected Mermaid diagrams to render icon-based Mermaid controls, including full view.');
assert.equal(runtimeDom.window.document.querySelector('.mermaid-zoom-label'), null, 'Expected Mermaid controls to remove the zoom percentage label.');
assert.equal(renderedContainer?.getAttribute('role'), null, 'Expected Mermaid diagrams to keep their native semantics.');

runtimeDom.window.HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
runtimeDom.window.HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new runtimeDom.window.Event('close'));
};

toolbarButtons[1].dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
assert.equal(renderedContainer?.dataset.zoom, '1.25', 'Expected the zoom-in control to increase the Mermaid zoom level.');
toolbarButtons[2].dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
assert.equal(renderedContainer?.dataset.zoom, '1', 'Expected the reset control to restore the Mermaid zoom level.');
toolbarButtons[3].dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
let lightbox = runtimeDom.window.document.querySelector('.mermaid-lightbox');
assert.ok(lightbox?.open, 'Expected the full-view control to open the Mermaid lightbox.');
lightbox?.close();

renderedContainer?.dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
lightbox = runtimeDom.window.document.querySelector('.mermaid-lightbox');
assert.ok(lightbox?.open, 'Expected clicking a Mermaid diagram to open the full-view lightbox.');
assert.ok(lightbox?.querySelector('.mermaid-lightbox-diagram svg'), 'Expected the full-view lightbox to contain the rendered Mermaid SVG.');

runtimeDom.window.document.documentElement.dataset.theme = 'dark';
runtimeDom.window.document.dispatchEvent(new runtimeDom.window.CustomEvent('modernization-kit-theme-change'));
await flush();

assert.equal(runtimeCalls.initialize.at(-1)?.theme, 'dark', 'Expected a theme change to reinitialize Mermaid for dark mode.');
assert.equal(renderedContainer?.dataset.renderedTheme, 'dark', 'Expected the Mermaid container to record the updated dark theme.');

const failureDom = createRuntimeDom(`<!doctype html><html data-theme="light"><body><pre data-language="mermaid"><code>flowchart LR\n  Review --> Publish</code></pre></body></html>`);
const originalConsoleError = console.error;
console.error = () => {};
try {
  setupMermaidDiagrams({
    document: failureDom.window.document,
    window: failureDom.window,
    loadMermaid: async () => ({
      initialize: () => {},
      run: async () => {
        throw new Error('Mermaid failed');
      }
    })
  });
  failureDom.window.document.dispatchEvent(new failureDom.window.Event('DOMContentLoaded'));
  await flush();
} finally {
  console.error = originalConsoleError;
}

const failedContainer = failureDom.window.document.querySelector('.mermaid');
assert.equal(failedContainer?.dataset.renderError, 'true', 'Expected Mermaid failures to leave a visible fallback state.');
assert.match(
  failedContainer?.textContent ?? '',
  /Mermaid diagram could not be rendered\./,
  'Expected the Mermaid failure fallback to show a user-visible error message.'
);

console.log('Rich media validation passed.');
