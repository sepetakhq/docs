---
title: Limits and buyer links
description: Code budgets, rate checks, per-IP backstops, idempotent verify, and where buyer emails point.
sidebar_position: 6
---

# Limits and buyer links

## Codes

A code lives five minutes and allows five tries. A contact gets five codes an hour and ten a day. Resends wait 60 seconds, then 5 minutes, then 30 minutes. A refused send answers `429 rate_limited` with `Retry-After` in seconds, so drive the resend countdown from that header.

## Rate checks

Live shipping rates spend a monthly per-shop quota of rate checks. The shop's plan sets it, and packs top it up. A quote for the same destination, cart weight and couriers from the last six hours is served again for free; a new weight spends a new check. When the quota runs out, `/shipping/rates` answers `409 rate_checks_exhausted`: show `message` and do not retry. Fetch rates when the destination or the cart changes, not on every render.

## Hourly backstops

Some routes carry an hourly budget per IP: code sends, `/shipping/destinations`, `/shipping/destinations/resolve`, `/shipping/rates`, payment retry and payment claim. They guard the platform, not your buyers, so do not count on one budget per buyer. Payment retry and claim also allow five calls per order per hour. A `429 rate_limited` carries `Retry-After`; wait that long, and do not retry in a loop.

## Idempotent verify

Send `Idempotency-Key` on `POST /checkout/otp/verify`, the call that places the order. No other route reads it. A retry with the same key and body returns the first answer with `Idempotent-Replay: true`. The same key with a different body answers `422`; a key still in progress answers `409 conflict` with `Retry-After`.

## Buyer links

Buyer links point at the shop's **primary domain**:

- The confirmation email and `track_url` open `/track/{token}`.
- Status emails open `/lacak`.
- A buyer coming back from a payment page lands on `/lacak`, with no token.

To keep buyers on your site, make your domain primary and serve both paths: `/track/{token}` from `GET /orders/track/{token}`, and `/lacak` from the `track_token` you kept in the browser, or from `/orders/lookup/otp/send` and `/verify`.

A plan change reaches the API within a minute.
