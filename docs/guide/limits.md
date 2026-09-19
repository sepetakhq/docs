---
title: Limits and buyer links
description: Code budgets, per-IP limits, idempotent retries, and where buyer emails point.
sidebar_position: 5
---

# Limits and buyer links

- Codes: five per contact per hour. Some routes have a per-IP budget, so call checkout from the buyer's browser rather than through a proxy; then each buyer counts as one.
- Retry a `POST` with `Idempotency-Key`. A replayed answer carries `Idempotent-Replay`.
- Confirmation emails and gateway returns point at the shop's **primary domain**. To land buyers on your site, make your domain primary and serve `/track/{token}` there.
- A plan change reaches the API within a minute.
