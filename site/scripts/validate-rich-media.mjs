import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { setupMermaidDiagrams } from '../src/scripts/mermaidDiagrams.js';

const readBuildFile = async (relativePath) => {
  const fileUrl = new URL(`../dist/${relativePath}`, import.meta.url);
  return readFile(fileUrl, 'utf8');
};

const placeholderHtml = await readBuildFile('identify/discovery-checklist/index.html');

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
assert.equal(renderedContainer?.getAttribute('role'), 'button', 'Expected rendered Mermaid diagrams to expose button semantics for keyboard activation.');
assert.equal(renderedContainer?.getAttribute('tabindex'), '0', 'Expected Mermaid diagrams to be keyboard-focusable for full-view access.');
assert.equal(renderedContainer?.classList.contains('mermaid--interactive'), true, 'Expected rendered Mermaid diagrams to opt into interactive styling only after SVG render succeeds.');

runtimeDom.window.HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
runtimeDom.window.HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new runtimeDom.window.Event('close'));
};

toolbarButtons[1].dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
assert.equal(renderedContainer?.dataset.zoom, '1.25', 'Expected the zoom-in control to increase the Mermaid zoom level.');
assert.equal(renderedContainer?.querySelector('svg')?.style.transformOrigin, 'center center', 'Expected zooming to keep the Mermaid diagram vertically centered.');
assert.equal(runtimeDom.window.document.querySelector('.mermaid-lightbox'), null, 'Expected zooming controls not to open the Mermaid lightbox.');
assert.equal(renderedContainer?.classList.contains('mermaid--zoomed'), true, 'Expected a non-default zoom level to mark the Mermaid diagram as zoomed for pan styling.');

renderedContainer?.dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
assert.equal(runtimeDom.window.document.querySelector('.mermaid-lightbox'), null, 'Expected clicking a zoomed Mermaid diagram to pan instead of opening the full-view lightbox.');
toolbarButtons[3].dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
let zoomedLightbox = runtimeDom.window.document.querySelector('.mermaid-lightbox');
assert.ok(zoomedLightbox?.open, 'Expected the expand button to open the full-view lightbox even while the diagram is zoomed.');
zoomedLightbox?.close();

toolbarButtons[2].dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
assert.equal(renderedContainer?.dataset.zoom, '1', 'Expected the reset control to restore the Mermaid zoom level.');
assert.equal(renderedContainer?.classList.contains('mermaid--zoomed'), false, 'Expected resetting zoom to clear the zoomed pan styling.');
assert.equal(runtimeDom.window.document.querySelector('.mermaid-lightbox'), null, 'Expected resetting zoom not to open the Mermaid lightbox.');
toolbarButtons[3].dispatchEvent(new runtimeDom.window.MouseEvent('click', { bubbles: true }));
let lightbox = runtimeDom.window.document.querySelector('.mermaid-lightbox');
assert.ok(lightbox?.open, 'Expected the full-view control to open the Mermaid lightbox.');
lightbox?.close();
renderedContainer?.dispatchEvent(new runtimeDom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
lightbox = runtimeDom.window.document.querySelector('.mermaid-lightbox');
assert.ok(lightbox?.open, 'Expected keyboard activation on the Mermaid diagram to open the full-view lightbox.');
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
assert.equal(failedContainer?.getAttribute('role'), null, 'Expected Mermaid failure fallback not to expose button semantics.');
assert.equal(failedContainer?.getAttribute('tabindex'), null, 'Expected Mermaid failure fallback not to remain keyboard-focusable.');
assert.match(
  failedContainer?.textContent ?? '',
  /Mermaid diagram could not be rendered\./,
  'Expected the Mermaid failure fallback to show a user-visible error message.'
);

const rerenderFailureDom = createRuntimeDom(`<!doctype html><html data-theme="light"><body><pre data-language="mermaid"><code>flowchart LR\n  Review --> Publish</code></pre></body></html>`);
let rerenderCount = 0;
console.error = () => {};
try {
  setupMermaidDiagrams({
    document: rerenderFailureDom.window.document,
    window: rerenderFailureDom.window,
    loadMermaid: async () => ({
      initialize: () => {},
      run: async ({ nodes }) => {
        rerenderCount += 1;
        if (rerenderCount > 1) {
          throw new Error('Mermaid failed on rerender');
        }

        nodes.forEach((node) => {
          node.innerHTML = '<svg aria-hidden="true"></svg>';
        });
      }
    })
  });
  rerenderFailureDom.window.document.dispatchEvent(new rerenderFailureDom.window.Event('DOMContentLoaded'));
  await flush();
  rerenderFailureDom.window.document.documentElement.dataset.theme = 'dark';
  rerenderFailureDom.window.document.dispatchEvent(new rerenderFailureDom.window.CustomEvent('modernization-kit-theme-change'));
  await flush();
} finally {
  console.error = originalConsoleError;
}

const rerenderFailureContainer = rerenderFailureDom.window.document.querySelector('.mermaid');
assert.equal(rerenderFailureContainer?.dataset.renderError, 'true', 'Expected rerender failures to mark Mermaid diagrams with the fallback error state.');
assert.equal(rerenderFailureContainer?.classList.contains('mermaid--interactive'), false, 'Expected rerender failures to remove Mermaid interactivity.');
assert.equal(rerenderFailureContainer?.getAttribute('role'), null, 'Expected rerender failures to remove Mermaid button semantics.');
assert.equal(rerenderFailureContainer?.getAttribute('tabindex'), null, 'Expected rerender failures to remove Mermaid keyboard activation.');
assert.equal(rerenderFailureDom.window.document.querySelector('.mermaid-toolbar')?.hidden, true, 'Expected rerender failures to hide Mermaid controls when no SVG is available.');

console.log('Rich media validation passed.');
