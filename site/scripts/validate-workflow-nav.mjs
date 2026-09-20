import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import astroConfig from '../astro.config.mjs';
import { processSteps } from '../src/data/process.js';

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
const findAnchorTags = (markup, href) => Array.from(markup.matchAll(new RegExp(
  `<a\\b[^>]*href="${escapeForRegExp(href)}"[^>]*>`,
  'ig'
)), ([anchorTag]) => anchorTag);
const hasActiveLink = (markup, href, ariaCurrent) => {
  const anchorTags = findAnchorTags(markup, href);

  return anchorTags.some((anchorTag) =>
    /class="[^"]*\bis-active\b[^"]*"/.test(anchorTag)
    && (!ariaCurrent || new RegExp(`aria-current="${ariaCurrent}"`).test(anchorTag)));
};
const hasCurrentLink = (markup, href) => {
  const anchorTags = findAnchorTags(markup, href);

  return anchorTags.some((anchorTag) => /aria-current="page"/.test(anchorTag));
};
const stepWithSections = processSteps.find((step) => step.sections?.length);

if (!stepWithSections) {
  throw new Error('Workflow navigation validation requires at least one configured stage subsection.');
}

const [firstSection] = stepWithSections.sections;
const stageHref = withBasePath(`/${stepWithSections.slug}/`);
const sectionHref = withBasePath(`/${stepWithSections.slug}/${firstSection.slug}/`);
const stagePage = await readBuiltPage(`${stepWithSections.slug}/index.html`);
const sectionPage = await readBuiltPage(`${stepWithSections.slug}/${firstSection.slug}/index.html`);

if (!stagePage.includes('class="stage-subnav"') || !stagePage.includes(`${stepWithSections.title} subsection navigation`)) {
  fail(`Expected the ${stepWithSections.title} stage page to render a labelled subsection navigation block.`);
}

if (!hasActiveLink(stagePage, stageHref, 'page')) {
  fail(`Expected the ${stepWithSections.title} stage page to keep the main stage link highlighted.`);
}

if (!stagePage.includes(`href="${sectionHref}"`)) {
  fail(`Expected the ${stepWithSections.title} stage page to render the centrally configured subsection link.`);
}

if (!hasActiveLink(sectionPage, stageHref)) {
  fail(`Expected the ${stepWithSections.title} subsection page to keep the main stage link highlighted.`);
}

if (!hasCurrentLink(sectionPage, sectionHref)) {
  fail(`Expected the active ${stepWithSections.title} subsection link to be marked with aria-current on nested routes.`);
}

if (process.exitCode) {
  throw new Error('Workflow navigation validation failed.');
}

console.log('Workflow navigation validation passed.');
