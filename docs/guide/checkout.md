---
title: Checkout in five calls
description: The server prices the cart; the buyer confirms with a one-time code; you receive track_token once.
sidebar_position: 3
---

# Checkout in five calls

The server prices the cart; your site sends `product_id` and `qty`, nothing more. The buyer confirms their contact with a one-time code on every order.

| Call                        | Does                                          | Returns                             |
| --------------------------- | --------------------------------------------- | ----------------------------------- |
| `POST /shipping/rates`      | quotes for the cart and the destination       | `shipping_quote_id`                 |
| `POST /checkout/draft`      | turns the cart into a priced draft            | `draft_id`, `total`, `otp_required` |
| `POST /checkout/otp/send`   | sends a code to the buyer's email or WhatsApp | `expires_at`                        |
| `POST /checkout/otp/verify` | checks the code and places the order          | `order`, `payment`, `track_token`   |
| `GET /orders/track/{token}` | status and payment instructions               | `order.timeline`, `payment`         |

The [API reference](/api) has the fields of every call.

## Rules the server enforces

- You receive `track_token` once. Keep it.
- Render `order.timeline` and `order.status_label` as given; the merchant or a gateway can move the status at any time.
- Branch on `payment.kind`. The server decides which gateway fulfils a method, so `payment.method` can change under you.
- Send a code when the buyer asks for one, and show a refused code as refused; the server does not say why.
