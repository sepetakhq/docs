---
title: Sepetak storefront API
description: Build your own storefront on a Sepetak shop. Same API as the hosted templates, no API key.
slug: /
sidebar_position: 1
---

import CopyPrompt from '@site/src/components/CopyPrompt';

# Sepetak storefront API

Build your own storefront on a Sepetak shop. Your site calls the same API the hosted templates use.

- **Base URL:** `https://<shop>.sepetak.com/api/v1` (any host the shop answers on)
- **Spec:** [`https://sepetak.com/openapi.json`](https://sepetak.com/openapi.json), OpenAPI 3.1. Add `?version=YYYY-MM-DD` for one version; without it you get the latest. An API call without `X-API-Version` gets the baseline ([Versions](/guide/versions))
- **Plan needed:** none. Every plan can read and check out. A browser page must run on a domain attached to the shop; on Gratis that takes the Domain sendiri add-on ([Access](/guide/access))
- **For machines:** [`/llms.txt`](pathname:///llms.txt); every guide page also exists as Markdown at its URL plus `.md` (the home page is `/index.md`, the reference is `/api/reference.md`)

## Using AI? Hand it this

<CopyPrompt text="Read https://docs.sepetak.com/llms.txt and https://sepetak.com/openapi.json, then build a storefront for https://<shop>.sepetak.com/api/v1. Follow the checkout rules in the guide exactly." />

## Where to start

1. [Access](/guide/access): there is no key; your site's domain decides.
2. [Quickstart](/guide/quickstart): one `fetch`.
3. [Checkout](/guide/checkout): the sequence and the rules the server enforces.
4. [Payments](/guide/payments): what to render for each payment kind.
5. [API reference](/api): every route and field, rendered from the spec.
