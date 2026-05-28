---
name: branded-documents-redirect
description: Use when the user asks about generating PDF, DOCX, XLSX, PPTX or HTML documents with corporate branding. Points at the ofelia-document-toolkit plugin which is the single source of truth for the Ofelia visual identity (logos, palettes, fonts, templates).
---

# Branded document generation — redirect

This toolkit no longer ships branding or document-generation code. The single source of truth is the `ofelia-document-toolkit` plugin, which exposes 10 MCP tools (`generate_docx`, `generate_pdf_from_html`, `generate_pdf_from_markdown`, `generate_xlsx`, `generate_pptx`, `generate_html`, `get_brand_palette`, `get_logo`, `get_branded_css`, `list_brand_variants`) and supports three brand variants: `ofelia` (corporate, Orange + Burgundy), `ofelia-agentic` (Plum + Lila), `bonita-bpm` (Brown + Yellow).

## How to use

Install the plugin once: see `https://github.com/bonitasoft-ps/ofelia-document-toolkit`.

Then ask Claude to generate the document in plain language — Claude will pick the right MCP tool and brand variant. The tools are stateless and accept a `brand` parameter, so anything from a weekly intervention report to an audit PDF, an upgrade plan DOCX, or a kickoff PPTX can be rendered with one prompt.

## Why this skill is just a redirect

Branding lives in `ofelia-document-toolkit` so the palette, logos and fonts have one canonical source. This repo (`bonita-ai-agent`) stays focused on Bonita expertise: skills, agents, commands and hooks for Bonita BPM development, audits and upgrades.
