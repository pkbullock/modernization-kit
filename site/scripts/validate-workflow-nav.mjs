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
const findAnchorTag = (markup, href) => markup.match(new RegExp(
  `<a\\b[^>]*href="${escapeForRegExp(href)}"[^>]*>`,
  'i'
))?.[0];
const hasActiveLink = (markup, href, ariaCurrent) => {
  const anchorTag = findAnchorTag(markup, href);

  return Boolean(anchorTag
    && /class="[^"]*\bis-active\b[^"]*"/.test(anchorTag)
    && (!ariaCurrent || new RegExp(`aria-current="${ariaCurrent}"`).test(anchorTag)));
};
const hasCurrentLink = (markup, href) => {
  const anchorTag = findAnchorTag(markup, href);

  return Boolean(anchorTag && /aria-current="page"/.test(anchorTag));
};

const planHref = withBasePath('/plan/');
const planPlaceholderHref = withBasePath('/plan/placeholder/');

const planPage = await readBuiltPage('plan/index.html');
const planPlaceholderPage = await readBuiltPage('plan/placeholder/index.html');

if (!planPage.includes('class="stage-subnav-shell"') || !planPage.includes('Plan subsection navigation')) {
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
