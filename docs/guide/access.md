---
title: Access
description: No API key. A server may call every route; a browser page must run on a domain attached to the shop.
sidebar_position: 1
---

# Access

There is no API key. The shop is the host you call.

| From      | Rule                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A server  | Open. A request with no `Origin` header passes for every method. Per-IP limits then count all your traffic as one caller ([Limits](/guide/limits)). |
| A browser | Your page's origin must be a domain attached to the shop. Every plan allows every method.                                                           |

## Attach your domain

The shop owner attaches your site's domain in the backoffice: **Staf, domain & API** → **Domain**. Mula, Tumbuh and Skala include own domains. On Gratis, the owner buys the **Domain sendiri** add-on first, one slot per hostname.

The API matches your origin by hostname only, over `http` or `https`; the port does not matter. Production does not accept `localhost` or an IP address as an origin, and neither can be attached. During development, call the API through your dev server's proxy, or from a hostname you have attached.

## Requests from a browser

Send `credentials: 'omit'` on every request. Cookies do not travel cross-origin, and the browser refuses a request that asks for them. So the cookie that lets a returning buyer skip the checkout code never reaches the API: expect `otp_required: true` on every draft ([Checkout](/guide/checkout)).

Besides `Content-Type`, a request may carry `X-API-Version`, `Idempotency-Key` and `X-Request-ID`; storefront routes read nothing else. A header outside the preflight's list fails it, so keep tracing headers such as `traceparent`, `baggage` and `sentry-trace` off these requests. Your code can read `X-Request-ID`, `Retry-After`, `Idempotent-Replay`, `X-API-Version`, `Deprecation` and `Sunset` from a response, but not `Date`.

## What a refusal looks like

| Origin                              | Answer                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Attached to another Sepetak shop    | `403 forbidden`, with CORS headers, so your page can read it.                                                          |
| Attached to no shop, or `localhost` | No CORS headers at all. The browser reports a CORS or network error and your code sees no response. Attach the domain. |

An operator can narrow API access for a whole plan by hand. A cross-origin request outside it answers `403 plan_limit` with `details.quota: "api_access"` and `details.need` (`read` or `write`). No plan sets such a limit by default. See [Errors](/guide/errors).
