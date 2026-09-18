---
title: Site
description: Astro site for hosting and publishing project content
---

## Purpose

This Astro site hosts the Modernisation Kit for the Microsoft 365 Patterns and Practices community. It includes an overview, five modernisation stage pages, kit folder links, and community resources.

The kit is in development. The site labels unfinished guidance and assets accordingly; it does not perform SharePoint tenant operations.

## Local Development

Use Node.js 22.12 or later within a supported Astro LTS release. Node.js 20 is not supported by the installed Astro version.

Run these commands from the repository root:

```bash
cd site
npm ci
npm run dev
```

Open the local URL printed by Astro. No tenant account or credentials are required.

## Build and Validation

Run from the `site/` folder:

```bash
npm run build
npm run preview
```

The build generates six static pages in `dist/`. Before publishing, check the following at desktop and mobile widths:

* Follow all five workflow links and confirm that the active navigation matches the page.
* Follow previous and next stage links, including the overview and toolkit endpoints.
* Toggle the colour theme and confirm that it persists after navigation and reload.
* Navigate by keyboard and check the skip link and visible focus indicators.
* Check for clipped text, page overflow, and missing community images.

The build validates compilation but does not replace browser checks or tenant-connected validation.

## Content and Styling

* [BaseLayout.astro](src/layouts/BaseLayout.astro) owns shared navigation, theme tokens, typography, and the footer.
* [index.astro](src/pages/index.astro) contains the overview and resource links.
* [process.js](src/data/process.js) defines stage summaries, activities, outcomes, and the repository URL.
* [Stage template](src/pages/%5Bslug%5D.astro) generates the five workflow pages.

The current pages use local stage data. Markdown ingestion from `../docs/` remains future work.

Community resource images are served from the [PnP community site](https://pnp.github.io/) and require network access. Light and dark themes follow the system preference until changed; a valid `scoutTheme=light` or `scoutTheme=dark` URL parameter overrides the stored preference on page load.

## Deployment

Deploy the generated `dist/` output through the repository's chosen static hosting workflow. This change does not provision hosting or publish the site. Routes currently assume hosting at the domain root; configure and verify Astro's base path and links before publishing under a repository subpath.
