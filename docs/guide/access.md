---
title: Access
description: No API key. A server may read anything; a browser needs a registered domain and a plan that covers the method.
sidebar_position: 1
---

# Access

There is no API key. The shop is the host you call.

| From      | Rule                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| A server  | Open. Every `GET` works without setup.                                                                                            |
| A browser | The page's origin must be a domain registered to the shop, and the plan decides: **Tumbuh** = `GET` only, **Skala** = everything. |

Registering a domain is done by Sepetak for now: send the domain name from the shop owner's account.

Always send `credentials: 'omit'`. Cookies never travel cross-origin, and a request that asks for them is refused by the browser.

## What a refusal looks like

A cross-origin request the plan does not cover answers `403` with code `plan_limit`; an origin that is not one of the shop's domains answers `403 forbidden`. Both carry CORS headers, so your page can read them. See [Errors](/guide/errors).
