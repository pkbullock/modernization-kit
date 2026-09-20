import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import astroConfig from '../astro.config.mjs';

const siteRoot = resolve(import.meta.dirname, '..');
const readBuiltPage = async (relativePath) => readFile(resolve(siteRoot, 'dist', relativePath), 'utf8');
const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};
const basePath = (astroConfig.base ?? '').replace(/\/$/, '');
const withBasePath = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!basePath) {
    return normalizedPath;
  }

  return normalizedPath === '/' ? `${basePath}/` : `${basePath}${normalizedPath}`;
};
const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasActiveLink = (markup, href, ariaCurrent) => new RegExp(
  `<a[^>]*href="${escapeForRegExp(href)}"(?=[^>]*class="[^"]*is-active[^"]*")${ariaCurrent ? `(?=[^>]*aria-current="${ariaCurrent}")` : ''}[^>]*>`
).test(markup);
const hasCurrentLink = (markup, href) => new RegExp(
  `<a[^>]*href="${escapeForRegExp(href)}"(?=[^>]*aria-current="page")[^>]*>`
).test(markup);

const planHref = withBasePath('/plan/');
const planPlaceholderHref = withBasePath('/plan/placeholder/');

const planPage = await readBuiltPage('plan/index.html');
const planPlaceholderPage = await readBuiltPage('plan/placeholder/index.html');

if (!planPage.includes('class="stage-subnav-shell"') || !planPage.includes('aria-label="Plan subsection navigation"')) {
  fail('Expected the Plan stage page to render a labelled subsection navigation block.');
}

if (!hasActiveLink(planPage, planHref, 'page')) {
  fail('Expected the Plan stage page to keep the main Plan link highlighted.');
}

if (!planPage.includes(`href="${planPlaceholderHref}"`)) {
  fail('Expected the Plan stage page to render the centrally configured subsection link.');
}

if (!hasActiveLink(planPlaceholderPage, planHref)) {
  fail('Expected the Plan subsection page to keep the main Plan link highlighted.');
}

if (!hasCurrentLink(planPlaceholderPage, planPlaceholderHref)) {
  fail('Expected the active Plan subsection link to be marked with aria-current on nested routes.');
}

if (process.exitCode) {
  throw new Error('Workflow navigation validation failed.');
}

console.log('Workflow navigation validation passed.');
