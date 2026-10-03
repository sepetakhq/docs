---
title: Errors
description: One envelope for every error. Branch on status and code; show message to the buyer.
sidebar_position: 5
---

# Errors

Every error is `{ "error": { "code", "message", "details" } }`. Branch on the status and `code`, never on `message`.

```json
{
  "error": {
    "code": "unsupported_api_version",
    "message": "Versi aplikasi ini sudah tidak didukung. Muat ulang halaman ya.",
    "details": {
      "requested": "2030-01-01",
      "supported": ["2026-09-05", "2026-09-09"],
      "latest": "2026-09-09"
    }
  }
}
```

`message` is Indonesian buyer copy for most refusals, and safe to show. Some answer in English: an unreadable or oversized body, an unknown `sort`, an unknown shop host, product or page, a reused `Idempotency-Key`, a paused shop and `500 internal`. Show your own copy for those.

`unavailable` is two different things: `409 unavailable` is stock, `503 unavailable` is an outage. Check the status as well as the code.

## Checkout and orders

| Status · code                            | Where                                               | Do                                                                                           |
| ---------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `400 bad_request`                        | any `POST`                                          | The body is missing or wrong; show `message` next to the form.                               |
| `400 bad_request`                        | `/checkout/otp/verify`, `/orders/lookup/otp/verify` | The code is wrong, expired or tried too often. One answer for all three; show it as refused. |
| `400 otp_required`                       | `/checkout/otp/verify`                              | Verify needs a code; call `/checkout/otp/send` first.                                        |
| `409 draft_expired`                      | send, verify                                        | The draft is older than 30 minutes. Build it again.                                          |
| `409 draft_consumed`, `409 order_exists` | send, verify                                        | The order already exists. Do not submit again.                                               |
| `409 unavailable`                        | draft, verify                                       | Stock changed. Send the buyer back to the cart.                                              |
| `409 voucher_limit`                      | send, verify                                        | The voucher is used up, overall or for this buyer. Rebuild the draft without it.             |
| `409 store_closed`                       | draft, send, verify                                 | The shop is on holiday. Show `message`; it names the reopening day when there is one.        |
| `409 conflict` + `Retry-After`           | verify                                              | The same `Idempotency-Key` is still running. Retry after that many seconds.                  |
| `422 unprocessable`                      | verify                                              | The `Idempotency-Key` was reused with a different body. Use a new key.                       |
| `429 rate_limited` + `Retry-After`       | code sends                                          | Too many codes. Drive the resend countdown from `Retry-After`.                               |
| `503 unavailable`                        | `/checkout/otp/send`                                | The code could not be delivered. Offer a retry.                                              |

## Shipping

| Status · code                              | Where                            | Do                                                                                        |
| ------------------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------- |
| `404 not_found`                            | `/shipping/*`                    | The shop uses `flat` shipping. Send `courier_code` instead ([Checkout](/guide/checkout)). |
| `409 destination_unserved`                 | `/shipping/destinations/resolve` | No courier reaches this place. Offer `details.alternatives`.                              |
| `409 no_routes`                            | `/shipping/rates`                | No courier serves the destination. Show `message`.                                        |
| `409 shipping_unavailable`                 | `/shipping/rates`                | Rates cannot be computed for this cart. Show `message`; do not retry.                     |
| `409 rate_checks_exhausted`                | `/shipping/rates`                | The shop has used its monthly rate checks. Show `message`; do not retry.                  |
| `409 quote_expired`                        | draft                            | The quote is older than six hours or the cart weight changed. Fetch rates again.          |
| `503 rates_unavailable`, `503 unavailable` | `/shipping/rates`                | Temporary. Offer a retry.                                                                 |

## Payments

| Status · code                                                                    | Where                                 | Do                                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `409 payment_already_made`, `409 order_not_payable`, `409 payment_window_closed` | `/orders/track/{token}/payment`       | The order already moved. Reload `/orders/track/{token}`.                 |
| `409 payment_in_progress`                                                        | `/orders/track/{token}/payment`       | Instructions are still being created. Wait, then reload.                 |
| `409 method_unavailable`, `409 payment_window_closing`                           | `/orders/track/{token}/payment`       | A new charge cannot open. Show `message`; the buyer contacts the seller. |
| `422 unprocessable`                                                              | `/orders/track/{token}/payment`       | The total is outside what the method accepts. Show `message`.            |
| `503 unavailable`                                                                | `/orders/track/{token}/payment`       | The payment provider is down. Offer a retry.                             |
| `409 conflict`                                                                   | `/orders/track/{token}/payment/claim` | The order is not manual or no longer awaits payment. Reload it.          |

## Access and everything else

| Status · code                 | Do                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `403 forbidden`               | Your origin is attached to another shop ([Access](/guide/access)).                |
| `403 plan_limit`              | An operator narrowed this shop's API access; `details.need` is `read` or `write`. |
| `400 unsupported_api_version` | Unknown date; `details.supported` lists the served ones.                          |
| `404 not_found`               | Unknown shop host, product, page or order token.                                  |
| `413 error`                   | The body is over 1 MB; `message` is English.                                      |
| `429 rate_limited`            | A per-IP budget ran out. Wait `Retry-After` seconds ([Limits](/guide/limits)).    |
| `500 internal`                | Our fault. Show your own copy and retry later.                                    |
| `503 unavailable`             | The shop is paused, or a dependency is down.                                      |
