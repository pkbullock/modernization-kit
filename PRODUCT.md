# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are SharePoint owners, administrators, modernization leads, and consulting teams who need to assess classic SharePoint pages, plan the target experience, convert content, and track review and publishing activities for a modernization program.

Secondary users include site owners, reviewers, and stakeholders who need status reporting, approval tracking, and rollout coordination across a SharePoint estate.

## Product Purpose

The PnP Modernization and Page Transformation Toolkit helps organizations identify classic SharePoint pages, plan target layouts, modernize pages using mappings and scripts, review results, and publish approved pages.

Success means giving a team a repeatable process and supporting assets to move a classic SharePoint experience toward modern pages with clear governance, review, and publication controls.

## Positioning

The product is not a single page conversion tool; it is an operational toolkit that combines process guidance, governance patterns, automation scripts, mapping assets, and tracking workflows for SharePoint page modernization programs.

Its distinct value is the end-to-end lifecycle: identify, plan, modernize, review, and publish.

## Operating Context

This product is used in SharePoint modernization initiatives across site collections, page inventories, and governance processes. It is designed for teams that work with classic pages, page usage data, approval states, review actions, and transformation mappings.

The repository includes:
- a documentation site (`site/`)
- reusable modernization assets and scripts (`kit/`)
- page layout mapping files (`kit/mappings/`)
- SharePoint Framework and automation tooling (`kit/spfx/`, `kit/scripts/`)
- publishing and review guidance in the `/docs` content and README

## Capabilities and Constraints

Confirmed capabilities:
- inventory and assess classic SharePoint pages and site usage
- plan candidate pages and target layouts
- define modernization scope rules and rollout status tracking
- convert pages using mapping files and scripts
- capture review issues and approval status
- publish approved pages and update tracking information

Confirmed constraints:
- the toolkit is intended for SharePoint modernization workflows, not generic website design
- the project supports documentation, scripts, code, and mappings as reusable project assets
- tenant-specific values and production content must remain configurable and should not be hard-coded in source-controlled assets

Open decisions:
- the specific rollout model and stakeholder structure vary by customer and estate; future work should not assume a single governance pattern
- the exact set of legacy page types, rules, and acceptable target layouts will differ by initiative and content inventory

## Brand Commitments

The product name is the "PnP Modernization and Page Transformation Toolkit." It is positioned as a practical, community-aligned toolkit for SharePoint modernization and is associated with the PnP model, SharePoint transformation guidance, and the modernization lifecycle described in the repository.

## Evidence on Hand

Real evidence in the repository:
- `README.md` defines the lifecycle: identify, plan, modernise, review, publish
- `site/` hosts the project content and public-facing documentation
- `kit/` contains scripts, SPFx assets, mappings, and supporting tooling
- `docs/` holds project documentation content

No product-specific visual identity, customer evidence, or formal brand system were identified in the repository beyond the project name and this documentation structure.

## Product Principles

1. Make modernization repeatable and measurable.
2. Keep governance, review, and publishing decisions explicit.
3. Provide practical automation as well as process guidance.
4. Respect SharePoint content realities and transformation constraints.
5. Support adoption and communication alongside technical conversion.

## Accessibility & Inclusion

No product-specific accessibility requirements were identified in the repository. Future work should support clear, understandable workflows and inclusive stakeholder communication, and should avoid assumptions that could exclude administrators, reviewers, or site owners.
