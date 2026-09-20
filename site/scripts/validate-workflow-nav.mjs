import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteRoot = resolve(import.meta.dirname, '..');
const readBuiltPage = async (relativePath) => readFile(resolve(siteRoot, 'dist', relativePath), 'utf8');
const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const planPage = await readBuiltPage('plan/index.html');
const planPlaceholderPage = await readBuiltPage('plan/placeholder/index.html');

if (!planPage.includes('class="stage-subnav-shell"') || !planPage.includes('aria-label="Plan subsection navigation"')) {
  fail('Expected the Plan stage page to render a labelled subsection navigation block.');
}

if (!planPage.includes('href="/modernization-kit/plan/"') || !planPage.includes('class="is-active"') || !planPage.includes('aria-current="page"')) {
  fail('Expected the Plan stage page to keep the main Plan link highlighted.');
}

if (!planPage.includes('<a href="/modernization-kit/plan/placeholder/"')) {
  fail('Expected the Plan stage page to render the centrally configured subsection link.');
}

if (!planPlaceholderPage.includes('href="/modernization-kit/plan/"') || !planPlaceholderPage.includes('class="is-active"')) {
  fail('Expected the Plan subsection page to keep the main Plan link highlighted.');
}

if (!planPlaceholderPage.includes('<a href="/modernization-kit/plan/placeholder/" aria-current="page"')) {
  fail('Expected the active Plan subsection link to be marked with aria-current on nested routes.');
}

if (process.exitCode) {
  throw new Error('Workflow navigation validation failed.');
}

console.log('Workflow navigation validation passed.');
