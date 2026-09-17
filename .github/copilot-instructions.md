---
title: Copilot Coding Instructions
description: Coding and validation rules for the PnP Modernization and Page Transformation Toolkit
author: Project maintainers
ms.date: 2026-09-14
ms.topic: reference
---

# Copilot Coding Instructions

## Technology Baseline

* Use PnP.PowerShell 3.1.0 for PnP PowerShell assets unless a task explicitly requires another version.
* Target SharePoint Framework 1.24.x beta or later for Copilot components, web parts, and application customizers.
* Align Node.js and npm versions with the supported version matrix for the selected SPFx release. Verify the matrix before changing project dependencies.
* Treat page layout mapping files as XML and preserve their established schema and semantics.

## PowerShell

* Use PnP.PowerShell cmdlets and established SharePoint patterns for SharePoint operations.
* Use interactive login by default and expose a `ClientId` parameter for authentication.
* Never embed credentials, tokens, tenant secrets, or client secrets in scripts or configuration committed to the repository.
* Validate parameters early and provide clear errors for missing tenant URLs, site URLs, lists, files, or mapping inputs.
* Prefer `-WhatIf`, dry-run, preview, or report-only behavior for operations that could modify pages, lists, or tracking data.
* Make writes explicit and keep discovery, planning, conversion, review, and publishing steps distinguishable.
* Return useful exit codes and write structured, actionable logs that identify the page, site, operation, and failure reason without exposing sensitive data.
* Keep tenant-specific values configurable. Do not hard-code site collections, list names, page paths, or production identifiers unless they are clearly sample values.

## SharePoint Framework

* Keep SPFx components focused on one user or operational need.
* Follow the supported SPFx project structure and dependency versions.
* Include tests and documentation for each component or meaningful behavior change.
* Document setup, local development, build, test, packaging, permissions, and deployment assumptions.
* Keep user-facing status and error messages understandable to site owners and reviewers.
* Avoid coupling components to a single tenant when a configuration or service abstraction is practical.

## XML Mapping Files

* Treat mapping files as data contracts, not free-form configuration.
* Preserve namespaces, required elements, attribute names, ordering requirements, and existing semantics.
* Validate every changed XML file for well-formedness.
* Include representative fixtures or examples when adding a new mapping rule.
* Fail clearly when a mapping is missing, ambiguous, unsupported, or incompatible with the source page.

## Testing and Validation

Run the narrowest relevant checks first, then the broader project checks when available:

* Run PSScriptAnalyzer for changed PowerShell files.
* Use Pester or another documented test strategy for logic that can be isolated from a tenant.
* Run the SPFx test, build, and packaging checks for changed SPFx projects.
* Validate changed XML files for well-formedness and, when available, against the project schema or mapping fixtures.
* For tenant-dependent scripts, separate offline validation from tenant-connected validation and document the required account, permissions, tenant, and cleanup expectations.
* Do not claim tenant behavior is verified when only static checks or mocked tests were run.

## Documentation and Style

* Use clear names that describe the SharePoint operation or modernization stage.
* Prefer small functions and explicit data flow over large scripts with hidden side effects.
* Keep Markdown headings and lists consistent with the repository style.
* Document assumptions, inputs, outputs, permissions, failure handling, and examples for operational assets.
* Update the README or relevant documentation when a new asset changes the supported workflow.

## Scope and Safety

Agents generate and maintain scripts, mappings, SPFx assets, tests, and documentation. They do not perform tenant operations as part of code generation. Ask the user to run tenant-connected commands in an appropriate environment and make any production-impacting behavior explicit in the documentation.
