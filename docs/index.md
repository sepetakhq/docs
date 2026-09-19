---
title: Sepetak storefront API
description: Build your own storefront on a Sepetak shop. Same API as the hosted templates, no API key.
slug: /
sidebar_position: 1
---

import CopyPrompt from '@site/src/components/CopyPrompt';

# Sepetak storefront API

Build your own storefront on a Sepetak shop. Your site calls the same API the hosted templates use.

- **Base URL** — `https://<shop>.sepetak.com/api/v1` (any host the shop answers on)
- **Spec** — [`https://sepetak.com/openapi.json`](https://sepetak.com/openapi.json), OpenAPI 3.1, one document per version (`?version=YYYY-MM-DD`)
- **Plan needed** — Tumbuh to read · Skala to check out ([Access](/guide/access))
- **For machines** — [`/llms.txt`](pathname:///llms.txt); every page also exists as `.md` at the same path

## Using AI? Hand it this

<CopyPrompt text="Read https://docs.sepetak.com/llms.txt and https://sepetak.com/openapi.json, then build a storefront for https://<shop>.sepetak.com/api/v1. Follow the checkout rules in the guide exactly." />

## Where to start

1. [Access](/guide/access) — there is no key; the rules are your origin and your plan.
2. [Quickstart](/guide/quickstart) — one `fetch`.
3. [Checkout in five calls](/guide/checkout) — the sequence and the rules the server enforces.
4. [API reference](/api) — every route and field, rendered from the spec.
