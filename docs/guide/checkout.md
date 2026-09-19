---
title: Checkout in five calls
description: Prices are computed server-side; the buyer confirms with a one-time code; track_token is returned once.
sidebar_position: 3
---

# Checkout in five calls

Prices are computed server-side; the cart sends only `product_id` and `qty`. The buyer confirms their contact with a one-time code on every order.

| Call                                                             | Returns                             |
| ---------------------------------------------------------------- | ----------------------------------- |
| `POST /shipping/rates` — quotes for cart + destination           | `shipping_quote_id`                 |
| `POST /checkout/draft` — cart becomes a priced draft             | `draft_id`, `total`, `otp_required` |
| `POST /checkout/otp/send` — code to the buyer's email / WhatsApp | `expires_at`                        |
| `POST /checkout/otp/verify` — code right, order placed           | `order`, `payment`, `track_token`   |
| `GET /orders/track/{token}` — status and payment instructions    | `order.timeline`, `payment`         |

Field-level shapes for each call are in the [API reference](/api).

## Rules the server enforces

- `track_token` is returned **once**. Keep it.
- Render `order.timeline` and `order.status_label` as given; status can move from the merchant's side at any time.
- Branch on `payment.kind`, never `payment.method`: which gateway fulfils a method is the server's decision.
- Never send a code automatically, and never guess why one was refused.
