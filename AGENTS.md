---
title: Agent Guidance
description: Contributor workflow and project context for the PnP Modernization and Page Transformation Toolkit
author: Project maintainers
ms.date: 2026-09-14
ms.topic: reference
---

# Agent Guidance

## Project Purpose

The PnP Modernization and Page Transformation Toolkit supports planning and delivering SharePoint page modernization projects. It helps teams identify classic pages, plan target layouts, convert pages, review results, and publish approved pages.

Agents support the creation and maintenance of project assets. They do not independently perform tenant-wide modernization, publish pages, change production content, or send user notifications.

## Modernization Lifecycle

Use the lifecycle as context when designing or updating an asset:

1. Identify sites, pages, usage data, and rollout status.
2. Plan candidate pages, target layouts, scope rules, project roles, and adoption communications.
3. Modernize pages using conversion mappings and record conversion results.
4. Review converted pages, log issues, assign reviewers, and capture approval.
5. Publish approved pages and update tracking information.

The lifecycle describes the human process. An implementation may support one stage without implementing the entire process.

## Repository Organization

Keep the repository readable and use the established folders for their intended purpose:

* `site/` is the Astro site that hosts and publishes the project content
* `kit/` contains tools and custom solutions, such as SPFx components and scripts
* `docs/` contains the Markdown content that the site ingests and publishes

Within the `kit/` folder, prefer an organization similar to the following when new areas are introduced:

* `kit/scripts/` for PnP PowerShell and supporting automation
* `kit/spfx/` for SharePoint Framework solutions, web parts, application customizers, and Copilot components
* `kit/mappings/` for XML page layout mapping files
* `kit/tools/` for custom tools built to support modernisation

Preserve an existing folder convention when one has already been established. Do not reorganize unrelated files as part of a focused change.

## Working Practices

* Start from the smallest relevant asset, symbol, script, mapping, or test.
* Read nearby code and documentation before changing behavior.
* Keep changes focused on the requested modernization capability.
* Explain assumptions when SharePoint tenant details, permissions, or source content are unavailable.
* Treat tenant-connected validation as an environment-dependent check and document the required prerequisites.
* Do not place secrets, access tokens, tenant data exports, or production content in source control.
* Prefer dry-run, preview, and report-only modes for scripts that could affect content.
* Record meaningful conversion decisions and failures in structured logs.
* Update documentation when an asset changes its inputs, outputs, setup, or operational behavior.

## Completion Expectations

A contribution is complete when the relevant implementation, documentation, validation, and test coverage are updated together. For PnP PowerShell, document tenant prerequisites and provide a practical validation path even when a fully isolated test is not possible. For SPFx solutions, include tests and documentation with the implementation. For XML mappings, validate that files are well-formed and preserve the expected mapping contract.

## External References

Use these references when they are relevant to the work:

* [PnP Script Samples](https://pnp.github.io/script-samples)
* [PnP Modernization guidance](https://learn.microsoft.com/sharepoint/dev/transform/modernize-user-interface-customizations)
* [SharePoint Framework documentation](https://learn.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
