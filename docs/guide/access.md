---
title: Access
description: No API key. A server may read anything; a browser needs a registered domain and a plan that covers the method.
sidebar_position: 1
---

# Access

There is no API key. The shop is the host you call.

| From      | Rule                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A server  | Open. Every `GET` works without setup.                                                                                                  |
| A browser | Your page's origin must be a domain registered to the shop, and the plan decides: **Tumbuh** allows `GET`, **Skala** allows everything. |

Sepetak registers your domain for now: send the domain name from the shop owner's account.

Send `credentials: 'omit'` on every request. Cookies do not travel cross-origin, and the browser refuses a request that asks for them.

## What a refusal looks like

A cross-origin request outside your plan answers `403` with code `plan_limit`. An origin that is not one of the shop's domains answers `403 forbidden`. Both carry CORS headers, so your page can read them. See [Errors](/guide/errors).
