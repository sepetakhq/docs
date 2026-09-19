---
title: Limits and buyer links
description: Code budgets, per-IP limits, idempotent retries, and where buyer emails point.
sidebar_position: 5
---

# Limits and buyer links

- Codes: five per contact per hour. Some routes are limited per IP — call checkout from the buyer's browser, not through a proxy, so each buyer counts as one.
- Retry a `POST` with `Idempotency-Key`; a replayed answer carries `Idempotent-Replay`.
- Confirmation emails and gateway returns point at the shop's **primary domain**. To land buyers on your site, make your domain primary and serve `/track/{token}` there.
- A plan change reaches the API within a minute.
