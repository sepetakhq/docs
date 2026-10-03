---
title: Checkout
description: Read the shipping mode, price a draft, confirm the buyer with a one-time code, keep track_token.
sidebar_position: 3
---

# Checkout

The server prices the cart; your site sends `product_id`, `variant_id` and `qty`, nothing more. Every amount is a whole-rupiah integer: `79000` is Rp 79.000.

## 1. Shipping

Read `commerce.shipping.mode` from `GET /storefront/config` first.

- **`flat`**: skip the shipping calls. The buyer picks one of `commerce.couriers`; send its `code` as `courier_code` in the draft.
- **`live`**: quote the cart for the buyer's address.

| Call                                  | Does                                       | Returns                                              |
| ------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `POST /shipping/destinations`         | searches places (`q`, 3+ characters)       | `results[].ref`                                      |
| `POST /shipping/destinations/resolve` | turns the picked `ref` into a quotable one | `destination.ref`                                    |
| `POST /shipping/rates`                | quotes the cart for `destination_ref`      | `options[].quote_id`, send it as `shipping_quote_id` |

Under `flat`, do not call these routes; they usually answer `404`. A resolve can answer `409 destination_unserved` with `details.alternatives` to offer instead. A quote lives six hours. A rate fetch for a new destination or cart weight costs the shop one of its monthly rate checks ([Limits](/guide/limits)): fetch rates when the destination or the cart changes, not on every render.

## 2. Order

| Call                        | Does                                 | Returns                                        |
| --------------------------- | ------------------------------------ | ---------------------------------------------- |
| `POST /checkout/draft`      | turns the cart into a priced draft   | `draft_id`, `total`, `voucher`, `otp_required` |
| `POST /checkout/otp/send`   | sends a code to the buyer's contact  | `channel`, `masked`, `expires_in_seconds`      |
| `POST /checkout/otp/verify` | checks the code and places the order | `order`, `payment`, `track_token`, `track_url` |
| `GET /orders/track/{token}` | status and payment instructions      | `order.timeline`, `payment`                    |

The [API reference](/api) has the fields of every call. Codes go out by email today; read `channel` from the send answer rather than assuming one.

## Rules the server enforces

- You receive `track_token` once. Keep it, in the browser too: a buyer returning from a payment page lands on `/lacak` without it ([Limits](/guide/limits)).
- From a browser on your own domain, `otp_required` is always `true`: the cookie that skips the code cannot travel cross-origin. Send a code before every verify.
- Send a code when the buyer asks for one, and show a refused code as refused; the server does not say why.
- A draft lives 30 minutes (`expires_at`). After that, send and verify answer `409 draft_expired`: build the draft again. The draft answers `409 quote_expired` when the `shipping_quote_id` is older than six hours or the cart weight changed: fetch rates again, then build the draft.
- A voucher that did not apply still produces a draft. Read `voucher.applied` and `voucher.reason` (for example `limit_reached`, `buyer_limit_reached`, `requirements_not_met`) and show `voucher.message`. A voucher used up after the draft answers `409 voucher_limit` on send or verify: rebuild the draft without the code. A cross-origin site learns a per-buyer limit only at verify.
- A shop on holiday stays browsable, and `/storefront/config` does not say it is closed. The draft, send and verify answer `409 store_closed`; `message` names the reopening day when the merchant set one. Tracking and payment keep working for orders already placed.
- Render `order.timeline` and `order.status_label` as given; the merchant, a gateway or a worker can move the status at any time.
- Branch on `payment.kind`, not `payment.method`. The server picks the gateway behind a method, so the same method can come back as a different kind. See [Payments](/guide/payments).
- `POST /orders/lookup/otp/send` and `/verify` list a buyer's 20 most recent orders after a code. The list carries no `track_token`, so it cannot open an order: the buyer needs the link from their confirmation email.

Every refusal has its own `code`; [Errors](/guide/errors) lists what to do with each.
